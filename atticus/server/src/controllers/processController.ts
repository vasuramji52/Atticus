// server/src/controllers/proposalController.ts
import { Request, Response } from "express";
import { getTaskById, createProposal, linkTaskToProposal } from "../services/firebaseService";
import { ProposalCreate, ProposalStatus } from "../schemas/proposalSchema";
import { generateProposalForTask } from "../services/geminiService";

type CreateProposalBody = { task_id: string };

export async function createProposalController(req: Request, res: Response) {
  try {
    const { task_id } = req.body as CreateProposalBody;
    if (!task_id) return res.status(400).json({ error: "Missing task_id" });

    const task = await getTaskById(task_id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const gen = await generateProposalForTask({
      task_id: task.task_id!,
      task_type: task.task_type,
      summary: task.summary,
      specialist_assigned: task.specialist_assigned,
      confidence: task.confidence,
      status: task.status,
      raw_input: task.raw_input,
    });

    const proposal: ProposalCreate = {
      task_id,
      specialist: gen.specialist,
      proposed_action: gen.proposed_action,
      draft_message: gen.draft_message,
      confidence: gen.confidence,
      status: "WAITING_APPROVAL" as ProposalStatus,
      created_at: new Date().toISOString()
    };

    const saved = await createProposal(proposal);

    // Link proposal onto the task so Stage 1 -> Stage 2 is connected
    await linkTaskToProposal(task_id, saved.proposal_id!);

    return res.status(201).json(saved);
  } catch (e) {
    console.error("❌ createProposal error:", e);
    return res.status(500).json({ error: "Failed to create proposal" });
  }
}
