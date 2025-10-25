export interface Task {
  task_id?: string;              // Firestore doc ID
  created_by: string;            // Cognito user ID
  task_type: string;             // e.g. "EMAIL_DRAFTER"
  summary: string;               // LLM summary
  specialist_assigned: string;   // e.g. "records_wrangler"
  confidence: number;            // classifier confidence
  status: string;                // PENDING / WAITING_APPROVAL / APPROVED
  raw_input: string;             // user input text
  attachments?: string[];        // file URLs if any
  stage2_id?: string;            // linked proposal
  created_at: string;            // ISO string
  updated_at: string;
}
