import { Request, Response } from "express";
import { classifyText } from "../services/geminiService";
import { createTask } from "../services/firebaseService";
import { TaskCreate, TaskStatus } from "../schemas/taskSchema";

type ClassifyResult = {
  task_type: string;
  summary: string;
  specialist_assigned: string;
  confidence: number;
};

type ClassifyBody = {
  raw_input: string;
  created_by: string;
};

export async function classifyInput(req: Request, res: Response) {
  try {
    const { raw_input, created_by } = req.body as ClassifyBody;

    if (!raw_input || !created_by) {
      return res.status(400).json({ error: "Missing raw_input or created_by" });
    }

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
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("❌ classifyInput error:", error);
    return res.status(500).json({ error: "Failed to classify input" });
  }
}
