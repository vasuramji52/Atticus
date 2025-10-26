// src/controllers/specialistRouter.ts
import { handleVoiceBotScheduler } from "../specialists/voiceBotScheduler";

export async function routeToSpecialist(task: any): Promise<string> {
  switch (task.specialist_assigned) {
    case "voice_bot_scheduler":
      return await handleVoiceBotScheduler(task);
    // case "records_wrangler": return await handleRecords(task);
    // case "legal_researcher": return await handleLegalResearch(task);
    default:
      return "I'm not sure how to handle that task yet.";
  }
}
