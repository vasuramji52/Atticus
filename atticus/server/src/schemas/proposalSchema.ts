export interface Proposal {
  proposal_id?: string;
  task_id: string;
  specialist: string;
  proposed_action: string;
  draft_message: string;
  checklist: string[];
  confidence: number;
  status: string;          // WAITING_APPROVAL / APPROVED / REJECTED
  created_at: string;
}
