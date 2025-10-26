// src/specialists/voiceBotScheduler.ts
import * as chrono from "chrono-node"; // npm install chrono-node
import { createAppointment } from "../services/firebaseService";

interface Task {
  raw_input: string;
  created_by: string;
  summary: string;
}

export async function handleVoiceBotScheduler(task: Task): Promise<string> {
  // Extract date/time from user speech using chrono
  const parsedDate = chrono.parseDate(task.raw_input);
  if (!parsedDate) {
    // For simplicity — in this version we assume the user always provides time
    return "I'm sorry, I couldn't find a date and time.";
  }

  // Save appointment to your DB
  const newAppointment = {
    created_by: task.created_by,
    summary: task.summary,
    scheduled_for: parsedDate.toISOString(),
    status: "CONFIRMED" as const,
    created_at: new Date().toISOString(),
  };

  await createAppointment(newAppointment);

  // Return the confirmation text to be converted into TTS
  return `Your appointment has been scheduled for ${parsedDate.toLocaleString()}.`;
}
