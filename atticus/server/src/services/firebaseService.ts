// server/src/services/firebaseService.ts
import { db } from "../config/firebase-admin";
import { Task, TaskCreate } from "../schemas/taskSchema";
import { Proposal, ProposalCreate } from "../schemas/proposalSchema";

export async function createTask(task: TaskCreate): Promise<Task> {
  const ref = await db.collection("tasks").add(task);
  await ref.update({ task_id: ref.id });
  const snap = await ref.get();
  return { task_id: ref.id, ...(snap.data() as Task) };
}

// You said you don't have this—add a tiny helper:
export async function getTaskById(task_id: string): Promise<Task | null> {
  const doc = await db.collection("tasks").doc(task_id).get();
  return doc.exists ? ({ task_id, ...(doc.data() as Task) }) : null;
}

export async function createProposal(p: ProposalCreate): Promise<Proposal> {
  const ref = await db.collection("proposals").add(p);
  await ref.update({ proposal_id: ref.id });
  const snap = await ref.get();
  return { proposal_id: ref.id, ...(snap.data() as Proposal) };
}

// link proposal back onto the task
export async function linkTaskToProposal(task_id: string, proposal_id: string) {
  await db.collection("tasks").doc(task_id).update({ stage2_id: proposal_id });
}