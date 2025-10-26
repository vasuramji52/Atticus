import express from "express";
import cors from "cors";
import classifyRoute from "./routes/classify"; 
import agentRoutes from "./routes/agent";
import voiceWebhookRoutes from "./routes/voiceWebhook";
import appointmentRoutes from "./routes/appointments"
import bodyParser from "body-parser";
import path from "path";


const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// register your route
app.use("/api/classify", classifyRoute);
app.use("/api/agent", agentRoutes);
app.use("/api/voice", voiceWebhookRoutes); 
app.use("/api/appointments", appointmentRoutes); 
app.use(express.static(path.join(__dirname, "../public")));
console.log("✅ Agent route mounted");

app.use((req, res) => {
  console.log(`🚨 No route matched: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

export default app; // 👈 this is how index.ts can import it