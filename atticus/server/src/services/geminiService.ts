import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import { raw } from "express";
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
You are a professional case intake analyst at a law firm. Your job is to classify messy client messages 
into structured tasks that can be routed to the correct specialist agent. 

You must not add explanations, reasoning, markdown, or natural language commentary.

You must always respond ONLY with a valid JSON object matching the following schema:

For every task that's not schedule_appointment, use these fields for the JSON object. 
{
  "created_by": string,
    "task_type": string,                 // e.g., "REQUEST_RECORDS", "EMAIL_DRAFTER", "LEGAL_RESEARCH", "SCHEDULE_APPOINTMENT" 
    "summary": string,                // a short but descriptive summary capturing the summarized context of the input and core of the request. Must have the key details and be comprehensible but not be too long.
    "specialist_assigned": string,   // one of ["records_wrangler", "client_comm_guru", "legal_researcher", "voice_bot_scheduler"]
    "confidence": number,             // a number between 0 and 1 reflecting how confident you are in this classification
    "status": TaskStatus,              // always "WAITING_APPROVAL" upon creation. Will be updated later.
    "raw_input": string,           // a full string transcription of what was inputed as a prompt          
}

For the schedule_appointment task_type, use these fields for the JSON object.
{
  "task_type": "SCHEDULE_APPOINTMENT",
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
    - "Send a follow-up email to Paul confirming the mediation date."

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
      summary: parsed.summary || "Could not classify message.",
      specialist_assigned: parsed.specialist_assigned || "general_specialist",
      confidence: parsed.confidence || 0.5,
      status: "WAITING_APPROVAL",
      raw_input: input,
    };
  } catch (error: any) {
    console.error("❌ Gemini classification failed:", error.message || error);
    return {
      task_type: "UNCATEGORIZED",
      summary: "Gemini call failed.",
      specialist_assigned: "general_specialist",
      confidence: 0.5,
      status: "WAITING_APPROVAL",
      raw_input: input,
    };
  }
}

type GenerateProposalInput = {
  task_id: string;
  task_type: string;
  summary: string;
  specialist_assigned: string;
  confidence: number;
  status: string;
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

Act as a professional legal assistant. Your goal is to generate clear, specific, and context-appropriate next steps
for the assigned specialist, along with a short professional message that the lawyer could send or use internally.

You must not add explanations or commentary.
Your response must be valid JSON only, following the schema below.

Task:
{
  "task_type": "${task.task_type}",
  "summary": "${task.summary}",
  "specialist_assigned": "${task.specialist_assigned}",
  "confidence": ${task.confidence},
  "status": "${task.status}",
  "raw_input": ${JSON.stringify(task.raw_input)}
}

Return ONLY JSON with the following fields:
{
  "task_id": string,               // the task_id from the input task
  "specialist": string,             // e.g., "records_wrangler", "client_comm_guru", "legal_researcher", "voice_bot_scheduler"
  "proposed_action": string,        // short actionable label (e.g., "REQUEST_RECORDS", "SEND_EMAIL", "FIND_CASES", "SCHEDULE_MEETING")
  "draft_message": string,          // short, ready-to-send message or legal note
  "confidence": number              // between 0 and 1
  "status": ProposalStatus        // always "WAITING_APPROVAL" upon creation
  created_at": string             // ISO timestamp  
}

Guidelines for "draft_message":
- Always professional and neutral in tone.
- Write as if for a real case file (no placeholders like [Name] or [Date] unless necessary).
- Keep it factual, courteous, and concise (2–3 sentences max).
- Match the content to the specialist’s expertise and the given task type.
- Do NOT repeat the task summary; build on it.

Examples by specialist:

- records_wrangler (REQUEST_RECORDS):
  Example user input: "Can you get my MRI results from Dr. Lee?"
  Example output:
  {
    "task_id": "task_001",
    "specialist": "records_wrangler",
    "proposed_action": "REQUEST_RECORDS",
    "draft_message": "Contact Dr. Lee’s office to request the client’s MRI results from June 2025. Verify receipt and upload to case file.",
    "confidence": 0.95,
    "status": "WAITING_APPROVAL",
    "created_at": "2025-10-25T17:45:00.000Z"
  }

- client_comm_guru (EMAIL_DRAFTER):
  Example user input: "Send an update email to the client about their settlement."
  Example output:
  {
    "task_id": "task_002",
    "specialist": "client_comm_guru",
    "proposed_action": "SEND_EMAIL",
    "draft_message": "Hi [Client], I wanted to provide a quick update — your settlement offer is being reviewed. We’ll reach out as soon as the next step is confirmed.",
    "confidence": 0.93,
    "status": "WAITING_APPROVAL",
    "created_at": "2025-10-25T17:45:00.000Z"
  }

- legal_researcher (LEGAL_RESEARCH):
  Example user input: "Find verdicts for rear-end collision cases in Florida."
  Example output:
  {
    "task_id": "task_003",
    "specialist": "legal_researcher",
    "proposed_action": "FIND_VERDICTS",
    "draft_message": "Search for Florida cases between 2015–2024 involving rear-end collisions. Summarize outcomes and key citations.",
    "confidence": 0.9,
    "status": "WAITING_APPROVAL",
    "created_at": "2025-10-25T17:45:00.000Z"
  }

- voice_bot_scheduler (SCHEDULE_APPOINTMENT):
  Example user input: "Schedule a mediation for next Wednesday at 3pm."
  Example output:
  {
    "task_id": "task_004",
    "specialist": "voice_bot_scheduler",
    "proposed_action": "SCHEDULE_MEDIATION",
    "draft_message": "Confirm mediation with all parties for Wednesday at 3:00 PM. Send calendar invites and ensure Zoom link or room booking is complete.",
    "confidence": 0.94,
    "status": "WAITING_APPROVAL",
    "created_at": "2025-10-25T17:45:00.000Z"
  }

If uncertain, set proposed_action = "REVIEW_MANUALLY" and draft_message = "Needs human review before proceeding."

Output must begin with "{" and end with "}".
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
