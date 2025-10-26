// server/src/routes/proposals.ts
import { Router } from "express";
import { createProposalController } from "../controllers/processController";

const router = Router();
router.post("/", createProposalController); // POST /api/proposals
export default router;
