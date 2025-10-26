export interface Approval {
  approval_id?: string;
  proposal_id: string;
  task_id: string;
  approved_by: string;
  status: string;          // APPROVED / REJECTED
  approved_at: string;
}
