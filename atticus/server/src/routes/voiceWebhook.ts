import { Router } from "express";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { checkAppointmentAvailability, createAppointment } from "../services/firebaseService";
import { classifyText, generateVoiceReply } from "../services/geminiService";
import { routeToSpecialist } from "../controllers/voiceBotController";
import { generateVoiceBuffer } from "../services/voiceAgentService";
import { getSession, setSession, clearSession } from "../services/sessionStore";

const router = Router();
const BASE_URL = process.env.BASE_URL;

router.all("/start", async(req, res) => {
  if (!BASE_URL) {
    console.error("❌ BASE_URL is missing. Check your .env file.");
    return res.status(500).send("Missing BASE_URL");
  }

  const greetingText = "Hi there, this is your AI legal assistant. How can I help you today.";

  // 🗣️ Convert greeting to ElevenLabs audio
  const greetingAudio = await generateVoiceBuffer(greetingText);
  const greetingFile = `tts-greeting-${Date.now()}.mp3`;
  const greetingPath = path.join(__dirname, "../../public", greetingFile);

  await fsPromises.writeFile(greetingPath, greetingAudio);
  const greetingUrl = `${BASE_URL}/${greetingFile}`;

  // 📨 Send TwiML back to Twilio
  const twiml = `
  <Response>
    <Gather input="speech" action="${BASE_URL}/api/voice/handle-speech" method="POST" timeout="5">
      <Play>${greetingUrl}</Play>
    </Gather>
  </Response>`;

  res.header("Content-Type", "text/xml");
  res.status(200).send(twiml.trim());
});

router.post("/incoming", (req, res) => {
  console.log("📞 Incoming call from:", req.body.From);

  const BASE_URL = process.env.BASE_URL;
  res.type("text/xml");
  res.send(`
    <Response>
      <Gather input="speech" action="${BASE_URL}/api/voice/handle-speech" method="POST" timeout="5">
        <Say>Hello! This is your AI legal assistant. How can I help you today?</Say>
      </Gather>
    </Response>
  `);
});

router.all("/outbound-records-twiml", (req, res) => {
  const fileUrl =
    (req.query.fileUrl as string) ||
    (req.body && (req.body.fileUrl as string)) ||
    "";

  if (!fileUrl) {
    console.error("❌ Missing fileUrl in outbound-records-twiml");
    res.header("Content-Type", "text/xml");
    return res
      .status(400)
      .send(`<Response><Say>Missing file URL.</Say></Response>`);
  }

  console.log("🎧 Twilio will play:", fileUrl);

  res.header("Content-Type", "text/xml");
  res.status(200).send(
    `<Response>
       <Play>${fileUrl}</Play>
     </Response>`.trim()
  );
});

router.post("/handle-speech", async (req, res) => {
  const callSid = req.body.CallSid;   // 🪄 Twilio call identifier
  const transcript = req.body.SpeechResult?.trim();
  console.log("🧏 User said:", transcript);

  const classification = await classifyText(transcript);
  console.log("🤖 Classification result:", classification);

  const session = getSession(callSid) || { lastTaskType: "" };

  const { voice_reply, date, time } = await generateVoiceReply(transcript, classification);
  let finalReply = voice_reply;

  // 🕒 If scheduling + slot detected → check availability
  if (classification.task_type === "SCHEDULE_APPOINTMENT" && date && time) {
    if (!date || !time) {
      finalReply = "Can you tell me the exact date and time you'd like to schedule?";
    }
    else{
          const isAvailable = await checkAppointmentAvailability(date, time);
    if (!isAvailable) {
      finalReply = `Unfortunately ${date} at ${time} is full. Do you have any other availability?`;

      // store the session so next reply can re-check
      setSession(callSid, {
        lastTaskType: "SCHEDULE_APPOINTMENT",
        lastDate: date,
        lastTime: time
      });

    } else {
        // Auto-book or confirm
        const scheduled_for = new Date(`${date}T${time}:00`).toISOString();

        await createAppointment({
          scheduled_for,
          summary: classification.summary,
          created_by: "voice_agent",
          status: "CONFIRMED",
          created_at: new Date().toISOString(),
        });

        finalReply = `All set. I've scheduled your appointment for ${date} at ${time}.`;
        clearSession(callSid);
      }
    }


  } else if (session.lastTaskType === "SCHEDULE_APPOINTMENT") {
    // 📅 user was previously prompted for a new time
    if (date && time) {
      const isAvailable = await checkAppointmentAvailability(date, time);
      if (!isAvailable) {
        finalReply = `That slot is also full. Do you have another time in mind?`;
        setSession(callSid, { lastTaskType: "SCHEDULE_APPOINTMENT" });
      } else {
        const scheduled_for = new Date(`${date}T${time}:00`).toISOString();

        await createAppointment({
          scheduled_for,
          summary: classification.summary,
          created_by: "voice_agent",
          status: "CONFIRMED",
          created_at: new Date().toISOString(),
        });

        finalReply = `Perfect. Your appointment has been scheduled for ${date} at ${time}.`;
        clearSession(callSid);
      }
    } else {
      finalReply = `I didn’t catch the new time. Could you repeat it?`;
    }
  }

  // 🗣️ TTS + Gather again
  const audioBuffer = await generateVoiceBuffer(finalReply);
  const fileName = `tts-${Date.now()}.mp3`;
  const publicDir = path.join(__dirname, "../../public");
  const filePath = path.join(publicDir, fileName);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  await fsPromises.writeFile(filePath, audioBuffer);
  const fileUrl = `${req.protocol}://${req.get("host")}/${fileName}`;

  res.type("text/xml").send(`
    <Response>
      <Gather input="speech" action="${BASE_URL}/api/voice/handle-speech" timeout="6">
        <Play>${fileUrl}</Play>
      </Gather>
      <Say>We didn't hear anything. Goodbye!</Say>
    </Response>
  `);
});


export default router;
