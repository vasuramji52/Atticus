export interface Approval {
  approval_id?: string;
  proposal_id: string;
  task_id: string;
  approved_by: string;
  status: string;          // APPROVED / REJECTED
  edits?: string | null;
  comment?: string | null;
  approved_at: string;
}
