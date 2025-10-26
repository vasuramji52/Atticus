export interface Appointment {
    appointment_id?: string;
    created_by: string;
    summary: string;
    scheduled_for: string;
    status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
    created_at: string;
}