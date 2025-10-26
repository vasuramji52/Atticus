export interface Appointment {
    appointment_id?: string;
    created_by: string;
    summary: string;
    scheduled_for: string;
    status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";          // SCHEDULED / COMPLETED / CANCELED
    created_at: string;
}
