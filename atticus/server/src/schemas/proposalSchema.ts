// server/src/schemas/proposalSchema.ts
export type ProposalStatus = "WAITING_APPROVAL" | "APPROVED" | "REJECTED";

export interface Proposal {
  proposal_id?: string;
  task_id: string;
  specialist: string;
  proposed_action: string;
  draft_message: string;
  confidence: number;
  status: ProposalStatus;
  created_at: string;
}

export type ProposalCreate = Omit<Proposal, "proposal_id">;
