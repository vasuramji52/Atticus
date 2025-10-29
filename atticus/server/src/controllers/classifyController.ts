import { Request, Response } from "express";
import { classifyText, generateLegalResearchSummary, generateClientCommMessage, generateRecordsWranglerAction} from "../services/geminiService";
import { createTask, updateTask } from "../services/firebaseService";
import { TaskCreate, TaskStatus } from "../schemas/taskSchema";

type ClassifyResult = {
  task_type: string;
  summary: string;
  specialist_assigned: string;
  confidence: number;
};

type ClassifyBody = {
  raw_input: string;
  // created_by: string;
};

export async function classifyInput(req: Request, res: Response) {
  try {
    // const { raw_input, created_by } = req.body as ClassifyBody;

    // if (!raw_input || !created_by) {
    //   return res.status(400).json({ error: "Missing raw_input or created_by" });
    // }

    const { raw_input } = req.body as ClassifyBody;
    const created_by = req.user?.sub;

    console.log("raw_input:", raw_input);
    console.log("created_by:", created_by);
    if (!raw_input || !created_by) {
      console.warn("missing input")
      return res.status(400).json({ error: "Missing raw_input or user not authenticated" });
    }

    console.log("calling classifytext");

    const result: ClassifyResult = await classifyText(raw_input);

    const newTask: TaskCreate = {
      created_by,
      task_type: result.task_type,
      summary: result.summary,
      specialist_assigned: result.specialist_assigned,
      confidence: result.confidence,
      status: "WAITING_APPROVAL" as TaskStatus, // or: as const
      raw_input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
const savedTask = await createTask(newTask);

    // 🚀 Step 3: Post-classification actions
    if (result.task_type === "LEGAL_RESEARCH") {
      console.log("📚 Triggering legal research summary generation...");
      const summaryData = await generateLegalResearchSummary(savedTask);

      // if your schema allows, update the task with the summary
      await updateTask(savedTask.task_id, {
        additional_data: summaryData, // or whatever field name you use
        updated_at: new Date().toISOString(),
      });

      return res.status(201).json({ ...savedTask, additional_data: summaryData });
    }

    if (result.task_type === "EMAIL_DRAFTER") {
      console.log("✉️ Triggering client comm guru generation...");
      const commData = await generateClientCommMessage(savedTask);

      await updateTask(savedTask.task_id, {
        additional_data: commData,
        updated_at: new Date().toISOString(),
      });

      return res.status(201).json({ ...savedTask, additional_data: commData });
    }

    if (result.task_type === "REQUEST_RECORDS") {
  console.log("📞 Triggering records wrangler action...");
  const recordsData = await generateRecordsWranglerAction(savedTask);

  await updateTask(savedTask.task_id, {
    additional_data: recordsData,
    updated_at: new Date().toISOString(),
  });

  // ✅ NEW: call yourself with Gemini's message
  const draftMessage = recordsData.draft_message;
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER; // 👈 your phone

  if (draftMessage && testPhoneNumber) {
    const { makeVoiceCall } = await import("../services/voiceAgentService");
    await makeVoiceCall(testPhoneNumber, draftMessage);
    console.log(`📞 Outbound call triggered with message: ${draftMessage}`);
  }

  return res.status(201).json({ ...savedTask, additional_data: recordsData });
}

    // If no follow-up needed, just return the saved task
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("❌ classifyInput error:", error);
    return res.status(500).json({ error: "Failed to classify input" });
  }
}
