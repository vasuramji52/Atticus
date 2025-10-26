import * as express from "express";
import * as cors from "cors";
import classifyRoute from "./routes/classify"; // 👈 this is your route file
import approvalRoute from "./routes/approve";
import taskRoute from "./routes/tasks";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// register your route
app.use("/api/classify", classifyRoute);
app.use("/api/approve", approvalRoute);
app.use("/api/tasks", taskRoute);

export default app; // 👈 this is how index.ts can import it