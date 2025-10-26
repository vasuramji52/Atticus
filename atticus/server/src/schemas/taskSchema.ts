// schemas/taskSchema.ts
export type TaskStatus = "WAITING_APPROVAL" | "APPROVED" | "REJECTED";

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
}

export type TaskCreate = Omit<Task, "task_id" | "stage2_id">;
