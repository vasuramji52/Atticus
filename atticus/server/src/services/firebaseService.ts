import { db } from "../config/firebase-admin";
import { Task } from "../schemas/taskSchema";
import { Approval } from "../schemas/approvalSchema";


export async function createTask(task: Task) {
  const taskRef = await db.collection("tasks").add(task);
  await taskRef.update({ task_id: taskRef.id });
  return { ...task, task_id: taskRef.id };
}

// Create a new approval document
export async function createApproval(approval: Approval) {
  const docRef = await db.collection("approvals").add(approval);
  const newDoc = await docRef.get();
  return { approval_id: docRef.id, ...newDoc.data() };
}

// Update approval status (approve/reject)
export async function updateApprovalStatus(id: string, status: string) {
  try {
    if (!id) throw new Error("Missing approval document ID");
    if (!status) throw new Error("Missing status value");

    const ref = db.collection("approvals").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      throw new Error(`Approval ${id} not found`);
    }

    await ref.update({
      status,
      approved_at: new Date().toISOString(),
    });

    const updatedDoc = await ref.get();
    return { approval_id: id, ...updatedDoc.data() };
  } catch (error) {
    console.error("❌ updateApprovalStatus error:", error);
    throw error;
 }
}

// Get all tasks
export async function getAllTasks() {
  const snapshot = await db.collection("tasks").orderBy("created_at", "desc").get();
  return snapshot.docs.map((doc) => ({ task_id: doc.id, ...doc.data() }));
}