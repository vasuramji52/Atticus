import { Router } from "express";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { classifyText } from "../services/geminiService";
import { routeToSpecialist } from "../controllers/voiceBotController";
import { generateVoiceBuffer } from "../services/voiceAgentService";

const router = Router();
const BASE_URL = process.env.BASE_URL;

router.all("/start", (req, res) => {
  if (!BASE_URL) {
    console.error("❌ BASE_URL is missing. Check your .env file.");
    return res.status(500).send("Missing BASE_URL");
  }

  const twiml = `
<Response>
  <Gather input="speech" action="${BASE_URL}/api/voice/handle-speech" method="POST" timeout="5">
    <Say>Hello! This is your AI legal assistant. How can I help you today?</Say>
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

router.post("/handle-speech", async (req, res) => {
  const transcript = req.body.SpeechResult;
  console.log("🧏 User said:", transcript);

  // Stage 1 — Classify intent
  const classification = await classifyText(transcript);
  console.log("🤖 Classification result:", classification);

  // Stage 2 — Route to specialist
  const replyText = await routeToSpecialist({
    ...classification,
    raw_input: transcript,
    created_by: "voice_agent", // or actual user id if available
  });

  // Convert reply to ElevenLabs TTS
  const audioBuffer = await generateVoiceBuffer(replyText);
  const fileName = `tts-${Date.now()}.mp3`;
  const publicDir = path.join(__dirname, "../../public");
  const filePath = path.join(publicDir, fileName);

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  await fsPromises.writeFile(filePath, audioBuffer);

  const fileUrl = `${req.protocol}://${req.get("host")}/${fileName}`;

  // Return TwiML to Twilio — plays back the AI's response
  res.type("text/xml");
  res.send(`
    <Response>
      <Gather input="speech" action="${BASE_URL}/api/voice/handle-speech" timeout="5">
        <Play>${fileUrl}</Play>
      </Gather>
      <Say>We didn't hear anything. Goodbye!</Say>
    </Response>
  `);
});

export default router;
