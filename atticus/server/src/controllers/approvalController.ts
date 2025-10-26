import { Request, Response } from "express";
import { createApproval, updateApprovalStatus } from "../services/firebaseService";
import { Approval } from "../schemas/approvalSchema";

export async function createApprovalController(req: Request, res: Response) {
  try {
    const { proposal_id, task_id, approved_by, status } = req.body as Approval;

    if (!proposal_id || !task_id || !approved_by || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const approval: Approval = {
      proposal_id,
      task_id,
      approved_by,
      status,
      approved_at: new Date().toISOString(),
    };

    /*
    export interface Approval {
  approval_id?: string;
  proposal_id: string;
  task_id: string;
  approved_by: string;
  status: string;          // APPROVED / REJECTED
  approved_at: string;
}
    */

    const saved = await createApproval(approval);
    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ createApprovalController error:", error);
    res.status(500).json({ error: "Failed to create approval" });
  }
}

export async function updateApproval(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing status field" });
    }

    const updated = await updateApprovalStatus(id, status);
    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ updateApproval error:", error);
    res.status(500).json({ error: "Failed to update approval" });
  }
}
