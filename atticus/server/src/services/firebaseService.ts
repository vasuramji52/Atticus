import { db } from "../config/firebase-admin";
import { Task } from "../schemas/taskSchema";

export async function createTask(task: Task) {
  const taskRef = await db.collection("tasks").add(task);
  await taskRef.update({ task_id: taskRef.id });
  return { ...task, task_id: taskRef.id };
}