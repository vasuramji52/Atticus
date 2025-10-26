import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;

export async function classifyText(input: string) {
  try {
    // 1️⃣ Initialize the new-style client
    const genAI = new GoogleGenAI({ apiKey, apiVersion: "v1" });

    // 2️⃣ Call generateContent via models API
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // or "gemini-2.0-pro" if you want higher reasoning
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are an AI assistant helping a law firm classify messy client messages 
into structured tasks that can be routed to the correct specialist agent. 
You must always respond ONLY with a valid JSON object matching the following schema:

{
  "task_type": string,               // e.g., "REQUEST_RECORDS", "EMAIL_DRAFTER", "LEGAL_RESEARCH", "SCHEDULE_APPOINTMENT"
  "specialist_assigned": string,     // one of ["records_wrangler", "client_comm_guru", "legal_researcher", "voice_bot_scheduler"]
  "summary": string,                 // a short (1–5 words) title capturing the core of the request without explicitly saying scheduling or without including the date (e.g., "consult session", "MRI records", "deposition")
  "transcript": string,              // a full string transcription of what was inputed as a prompt
  "confidence": number               // a number between 0 and 1 reflecting how confident you are in this classification
}

Available specialists and their example tasks:
- records_wrangler:
  • REQUEST_RECORDS → retrieving medical records or bills
  • Example user messages:
    - "Can you get me my MRI results from Dr. Lee?"
    - "We need the hospital bills from the ER visit."

- client_comm_guru:
  • EMAIL_DRAFTER → drafting or replying to client messages
  • Example user messages:
    - "Can you write an email to the insurance adjuster?"
    - "Send a follow-up email confirming the mediation date."

- legal_researcher:
  • LEGAL_RESEARCH → finding and summarizing verdicts, citations, legal facts
  • Example user messages:
    - "Can you find similar verdicts for rear-end collision cases?"
    - "Research Florida case law for slip and fall liability."

- voice_bot_scheduler:
  • SCHEDULE_APPOINTMENT → coordinating depositions, mediations, or check-ins
  • Example user messages:
    - "I want to schedule a deposition next Friday at 10am."
    - "Set up a client check-in for Tuesday at 2pm."

Your task:
Given the following message from the user:

"""${input}"""

Classify it into the correct task_type and specialist_assigned.
If the input is unclear, pick "UNCATEGORIZED" for task_type and "general_specialist" for specialist_assigned.

Return ONLY valid JSON in your reply.
`

            }
          ]
        }
      ]
    });

    // 3️⃣ Extract model text output
    const text = result.text ?? "";
    console.log("💬 Raw Gemini output:", text);

    // 4️⃣ Parse JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      task_type: parsed.task_type || "UNCATEGORIZED",
      specialist_assigned: parsed.specialist_assigned || "general_specialist",
      summary: parsed.summary || "Could not classify message.",
      confidence: parsed.confidence || 0.5,
    };
  } catch (error: any) {
    console.error("❌ Gemini classification failed:", error.message || error);
    return {
      task_type: "UNCATEGORIZED",
      specialist_assigned: "general_specialist",
      summary: "Gemini call failed.",
      confidence: 0.5,
    };
  }
}

type GenerateProposalInput = {
  task_id: string;
  task_type: string;
  summary: string;
  specialist_assigned: string;
  raw_input: string;
};

export async function generateProposalForTask(task: GenerateProposalInput) {
  try {
    const genAI = new GoogleGenAI({ apiKey, apiVersion: "v1" });

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are an AI assistant helping a law firm draft next actions (proposals) from a classified task.

Task:
{
  "task_id": "${task.task_id}",
  "task_type": "${task.task_type}",
  "summary": "${task.summary}",
  "specialist_assigned": "${task.specialist_assigned}",
  "raw_input": ${JSON.stringify(task.raw_input)}
}

Return ONLY JSON with fields:
{
  "specialist": "records_wrangler",
  "proposed_action": "OUTREACH_PROVIDER",
  "draft_message": "Short, ready-to-send message...",
  "confidence": 0.92
}
`
            }
          ]
        }
      ]
    });

    const text = result.text ?? "";
    console.log("💬 Raw Gemini proposal output:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      specialist: parsed.specialist || task.specialist_assigned,
      proposed_action: parsed.proposed_action || "REVIEW_MANUALLY",
      draft_message: parsed.draft_message || "No draft available.",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.6
    };
  } catch (err: any) {
    console.error("❌ Gemini proposal failed:", err.message || err);
    return {
      specialist: task.specialist_assigned,
      proposed_action: "REVIEW_MANUALLY",
      draft_message: "Gemini call failed. Please draft manually.",
      confidence: 0.5
    };
  }
}
