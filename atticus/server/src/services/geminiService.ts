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
