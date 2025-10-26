// schemas/taskSchema.ts
export type TaskStatus = "WAITING_APPROVAL" | "APPROVED" | "REJECTED";
export interface LegalResearchData {
  jurisdiction?: string | null;
  topic?: string;
  situation_summary?: string;
  legal_analysis?: string;
  draft_summary?: string;
}
interface ClientCommData {
  tone?: "professional" | "empathetic" | "assertive";
  subject?: string;
  draft_email?: string;
  follow_up_needed?: boolean;
}

export interface Task {
  task_id?: string;
  created_by: string;
  task_type: string;
  summary: string;
  specialist_assigned: string;
  confidence: number;
  status: TaskStatus;
  raw_input: string;
  stage2_id?: string;
  created_at: string;
  updated_at: string;

  additional_data?: any | LegalResearchData | ClientCommData
}

export type TaskCreate = Omit<Task, "task_id" | "stage2_id">;
