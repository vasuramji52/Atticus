import { Router } from "express";
import path from "path";
import { promises as fsPromises } from "fs";
import { generateVoiceBuffer, makeVoiceCall } from "../services/voiceAgentService";

const router = Router();
router.get("/", (req, res) => {
  res.send("✅ Agent base route is alive");
});

// Generate audio only (no call)
router.post("/voice", async (req, res) => {
  try {
    const { script } = req.body;
    if (!script) return res.status(400).json({ error: "Missing script text" });

    const audioBuffer = await generateVoiceBuffer(script);
    const fileName = `tts-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "../../public", fileName);

    await fsPromises.writeFile(filePath, audioBuffer.subarray(0));

    const fileUrl = `${req.protocol}://${req.get("host")}/${fileName}`;
    res.json({ success: true, fileUrl });
  } catch (error: any) {
    console.error("Voice generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate audio + make Twilio call
router.post("/voice-call", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Missing phone number" });
    }

    const callSid = await makeVoiceCall(phone);

    res.json({
      success: true,
      callSid,
      message: `Voice bot call initiated to ${phone}`,
    });
  } catch (error: any) {
    console.error("❌ Voice call error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
