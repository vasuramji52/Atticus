// import { db } from "../config/firebase-admin";
// import { Task } from "../schemas/taskSchema";
// import { Proposal } from "../schemas/proposalSchema";
// import { Approval } from "../schemas/approvalSchema";
// import { Specialist } from "../schemas/specialistSchema";

// (async () => {
//   // 1. Seed Specialists
//   const specialists: Specialist[] = [
//     {
//       specialist_id: "records_wrangler",
//       name: "Records Wrangler",
//       description: "Retrieves missing medical records and bills.",
//       example_tasks: ["REQUEST_RECORDS"],
//       color: "#5E1802"
//     },
//     {
//       specialist_id: "client_comm_guru",
//       name: "Client Communication Guru",
//       description: "Drafts client messages.",
//       example_tasks: ["EMAIL_DRAFTER"],
//       color: "#508484"
//     },
//     {
//       specialist_id: "legal_researcher",
//       name: "Legal Researcher",
//       description: "Finds and summarizes verdicts and citations.",
//       example_tasks: ["LEGAL_RESEARCH"],
//       color: "#A78872"
//     },
//     {
//       specialist_id: "voice_bot_scheduler",
//       name: "Voice Bot Scheduler",
//       description: "Coordinates depositions, mediations, or check-ins.",
//       example_tasks: ["SCHEDULE_APPOINTMENT"],
//       color: "#65716F"
//     },
//     {
//       specialist_id: "evidence_sorter",
//       name: "Evidence Sorter",
//       description: "Extracts and labels attachments or media files.",
//       example_tasks: ["EVIDENCE_UPLOAD"],
//       color: "#C17C74"
//     },
//   ];

//   const batch = db.batch();
//   specialists.forEach((spec) => {
//     const ref = db.collection("specialists").doc(spec.specialist_id);
//     batch.set(ref, spec);
//   });
//   await batch.commit();
//   console.log("✅ Specialists seeded.");

//   // 2. Seed one Task
//   const taskRef = await db.collection("tasks").add({
//     created_by: "uid123",
//     task_type: "REQUEST_RECORDS",
//     summary: "Client missing MRI from Dr. Lee.",
//     specialist_assigned: "records_wrangler",
//     confidence: 0.91,
//     status: "WAITING_APPROVAL",
//     raw_input: "Hey, I still haven’t received my MRI results from Dr. Lee.",
//     attachments: [],
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//   });
//   await taskRef.update({ task_id: taskRef.id });
//   console.log(`✅ Task created with ID ${taskRef.id}`);

//   // 3. Seed one Proposal
//   const proposalRef = await db.collection("proposals").add({
//     task_id: taskRef.id,
//     specialist: "records_wrangler",
//     proposed_action: "OUTREACH_PROVIDER",
//     draft_message: "Dear Dr. Lee, please send MRI results for client.",
//     confidence: 0.89,
//     status: "WAITING_APPROVAL",
//     created_at: new Date().toISOString(),
//   });
//   await proposalRef.update({ proposal_id: proposalRef.id });
//   console.log(`✅ Proposal created with ID ${proposalRef.id}`);

//   // 4. Seed one Approval
//   const approvalRef = await db.collection("approvals").add({
//     proposal_id: proposalRef.id,
//     task_id: taskRef.id,
//     approved_by: "uid123",
//     status: "APPROVED",
//     approved_at: new Date().toISOString(),
//   });
//   await approvalRef.update({ approval_id: approvalRef.id });
//   console.log(`✅ Approval created with ID ${approvalRef.id}`);
// })();
