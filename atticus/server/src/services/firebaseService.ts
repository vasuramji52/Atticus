// server/src/services/firebaseService.ts
import { db } from "../config/firebase-admin";
import { Task, TaskCreate } from "../schemas/taskSchema";
import { Proposal, ProposalCreate } from "../schemas/proposalSchema";
import { Approval } from "../schemas/approvalSchema";

import { Appointment } from "../schemas/appointmentSchema";

export async function createTask(task: TaskCreate): Promise<Task> {
  const ref = await db.collection("tasks").add(task);
  await ref.update({ task_id: ref.id });
  const snap = await ref.get();
  return { task_id: ref.id, ...(snap.data() as Task) };
}

export async function updateTask(task_id: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    if (!task_id) {
      throw new Error("Missing task_id for update");
    }

    const taskRef = db.collection("tasks").doc(task_id);
    const snapshot = await taskRef.get();

    if (!snapshot.exists) {
      console.warn(`⚠️ Task with ID ${task_id} not found`);
      return null;
    }

    const dataToUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await taskRef.update(dataToUpdate);

    const updatedSnap = await taskRef.get();
    return { task_id: updatedSnap.id, ...(updatedSnap.data() as Task) };
  } catch (error) {
    console.error("❌ updateTask error:", error);
    throw error;
  }
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

    const approvalData = doc.data();
    const proposalId = approvalData?.proposal_id;
    const taskId = approvalData?.task_id;

    await ref.update({
      status,
      approved_at: new Date().toISOString(),
    });

    if (status === "REJECTED") {
      if (proposalId) {
        await db.collection("proposals").doc(proposalId).delete();
        console.log(`🗑️ Proposal ${proposalId} deleted after rejection`);
      }

      if (taskId) {
        await db.collection("tasks").doc(taskId).update({ status: "REVIEWED" });
        console.log(`✅ Task ${taskId} marked as REVIEWED`);
      } 
    } 

    else if (status === "APPROVED") {
      if (taskId) {
        await db.collection("tasks").doc(taskId).update({ status: "APPROVED" });
        console.log(`✅ Task ${taskId} marked as APPROVED`);
      }

      if (proposalId) {
        await db.collection("proposals").doc(proposalId).update({ status: "APPROVED" });
        console.log(`✅ Proposal ${proposalId} marked as APPROVED`);
      }
    }

    const updatedDoc = await ref.get();
    return { approval_id: id, ...updatedDoc.data() };
  } catch (error) {
    console.error("❌ updateApprovalStatus error:", error);
    throw error;
 }
}

export async function checkAppointmentAvailability(date: string, time: string): Promise<boolean> {
  try {
    // We'll assume your Appointment schema has `date` and `time` fields stored as strings
    // Alternatively, you could use a combined ISO datetime field — just adjust this query accordingly.
    const snapshot = await db.collection("appointments")
      .where("date", "==", date)
      .where("time", "==", time)
      .get();

    return snapshot.empty; // true means no existing appointment at that slot
  } catch (error) {
    console.error("❌ Error checking appointment availability:", error);
    // If something fails, play it safe and return false
    return false;
  }
}
// Get all tasks
export async function getAllTasks() {
  const snapshot = await db.collection("tasks").orderBy("created_at", "desc").get();
  return snapshot.docs.map((doc) => ({ task_id: doc.id, ...doc.data() }));
}
export async function createAppointment(appointment: Appointment) {
  const appointmentRef = await db.collection("appointments").add(appointment);
  await appointmentRef.update({ appointment_id: appointmentRef.id });
  return { ...appointment, appointment_id: appointmentRef.id };
}