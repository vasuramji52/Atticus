import { Request, Response } from "express";
import { getAllTasks} from "../services/firebaseService";

// GET /api/tasks
export async function getTasks(req: Request, res: Response) {
  try {
    const tasks = await getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("❌ getTasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}
