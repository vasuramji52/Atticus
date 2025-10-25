// server/src/services/geminiService.ts
interface GeminiClassification {
  task_type: string;
  specialist_assigned: string;
  summary: string;
  confidence: number;
}

export async function classifyText(input: string): Promise<GeminiClassification> {
  // For now: use simple keyword-based mock
  const lower = input.toLowerCase();

  if (lower.includes("mri") || lower.includes("records")) {
    return {
      task_type: "REQUEST_RECORDS",
      specialist_assigned: "records_wrangler",
      summary: "Client missing medical record or MRI from provider.",
      confidence: 0.9,
    };
  } else if (lower.includes("call") || lower.includes("schedule")) {
    return {
      task_type: "SCHEDULE_APPOINTMENT",
      specialist_assigned: "voice_bot_scheduler",
      summary: "Scheduling or follow-up needed.",
      confidence: 0.85,
    };
  } else if (lower.includes("email") || lower.includes("message")) {
    return {
      task_type: "EMAIL_DRAFTER",
      specialist_assigned: "client_comm_guru",
      summary: "Drafting a client message or email response.",
      confidence: 0.8,
    };
  } else {
    return {
      task_type: "LEGAL_RESEARCH",
      specialist_assigned: "legal_researcher",
      summary: "Legal research or analysis required.",
      confidence: 0.75,
    };
  }
}