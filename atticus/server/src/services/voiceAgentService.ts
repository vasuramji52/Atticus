import axios from "axios";
import twilio from "twilio";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

// -----------------------------
// Load environment variables
// -----------------------------
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(TWILIO_SID, TWILIO_AUTH);

// -----------------------------
// 1. Generate ElevenLabs Audio
// -----------------------------
export async function generateVoiceBuffer(script: string): Promise<Uint8Array> {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

    const response = await axios.post(
      url,
      {
        text: script,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Return as Uint8Array for clean fs writing
    return new Uint8Array(response.data);
  } catch (error: any) {
    if (error.response?.data) {
    console.error("❌ ElevenLabs TTS error:", Buffer.from(error.response.data).toString());
  } else {
    console.error("❌ ElevenLabs TTS error:", error);
  }
  throw new Error("Failed to generate audio with ElevenLabs");
  }
}

// -----------------------------
// 2. Trigger Twilio Call
// -----------------------------
export async function makeVoiceCall(toNumber: string, script?: string): Promise<string> {
  const BASE_URL = process.env.BASE_URL;
  const message = script ?? "Hello, this is the Records Wrangler calling.";

  // 🗣️ Convert message to audio file
  const audioBuffer = await generateVoiceBuffer(message);
  const fileName = `tts-${Date.now()}.mp3`;
  const filePath = path.join(__dirname, "../../public", fileName);

  if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, audioBuffer);

  const fileUrl = `${BASE_URL}/${fileName}`;

  const call = await client.calls.create({
    to: toNumber,
    from: TWILIO_PHONE,
    url: `${BASE_URL}/api/voice/outbound-records-twiml?fileUrl=${encodeURIComponent(fileUrl)}`
  });

  console.log(`📞 Twilio call started: ${call.sid}`);
  return call.sid;
}


// -----------------------------
// 3. Optional: Generate Gemini Script (Mock)
// -----------------------------
// This can later call Gemini API to generate scripts dynamically
export async function generateVoiceBotScript(task: string): Promise<string> {
  // Mock for now
  return `Hi, this is Morgan & Morgan. We're calling to confirm your appointment for ${task}. Please press 1 to confirm or call us back.`;
}
