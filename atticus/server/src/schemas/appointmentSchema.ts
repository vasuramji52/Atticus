// src/schemas/appointmentSchema.ts
export interface Appointment {
  appointment_id?: string;
  created_by: string;
  summary: string;
  scheduled_for: string;  // ISO timestamp
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
  created_at: string;
}