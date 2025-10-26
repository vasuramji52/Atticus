import { Router } from "express";
import { db } from "../config/firebase-admin";

const router = Router();

// GET /api/appointments
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("appointments").orderBy("scheduled_for", "asc").get();
    const appointments = snapshot.docs.map(doc => ({
      appointment_id: doc.id,
      ...doc.data()
    }));

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

export default router;
