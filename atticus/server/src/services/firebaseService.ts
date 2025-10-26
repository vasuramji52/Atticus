import { db } from "../config/firebase-admin";
import { Task } from "../schemas/taskSchema";
import { Appointment } from "../schemas/appointmentSchema";

export async function createTask(task: Task) {
  const taskRef = await db.collection("tasks").add(task);
  await taskRef.update({ task_id: taskRef.id });
  return { ...task, task_id: taskRef.id };
}
export async function createAppointment(appointment: Appointment) {
  const appointmentRef = await db.collection("appointments").add(appointment);
  await appointmentRef.update({ appointment_id: appointmentRef.id });
  return { ...appointment, appointment_id: appointmentRef.id };
}