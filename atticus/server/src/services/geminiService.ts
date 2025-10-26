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
You are an AI assistant helping a law firm classify messages.

Input text:
"""${input}"""

Output JSON fields:
{
  "task_type": "REQUEST_RECORDS",
  "specialist_assigned": "records_wrangler",
  "summary": "Client requests MRI results from Dr. Lee.",
  "confidence": 0.95
}
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
