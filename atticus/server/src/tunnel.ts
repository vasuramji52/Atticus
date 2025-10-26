// src/tunnel.ts
import localtunnel from "localtunnel";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const numberSid = process.env.TWILIO_NUMBER_SID!;
const client = twilio(accountSid, authToken);

async function startTunnel() {
  // 1️⃣ Start tunnel
  const tunnel = await localtunnel({ port: 5000 });
  const newBaseUrl = tunnel.url;
  console.log(`🚀 Tunnel started at: ${newBaseUrl}`);

  // 2️⃣ Update Twilio webhook
  await client.incomingPhoneNumbers(numberSid).update({
    voiceUrl: `${newBaseUrl}/api/voice/start`,
    voiceMethod: "POST",
  });
  console.log("✅ Twilio webhook updated.");

  // 3️⃣ Update env variable in runtime
  process.env.BASE_URL = newBaseUrl;

  // 4️⃣ Start server in-process
  await import("./index");

  // 5️⃣ Clean shutdown
  process.on("SIGINT", () => {
    tunnel.close();
    console.log("🛑 Tunnel closed.");
    process.exit();
  });
}

startTunnel();
