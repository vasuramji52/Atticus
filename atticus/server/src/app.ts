import * as express from "express";
import * as cors from "cors";
import classifyRoute from "./routes/classify";
import proposals from "./routes/process";


const app = express();

// middleware
app.use(cors());
app.use(express.json());

// register your route
app.use("/api/classify", classifyRoute);
app.use("/api/proposals", proposals);

export default app; // 👈 this is how index.ts can import it