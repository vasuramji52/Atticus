import { Router } from "express";
import { classifyInput } from "../controllers/classifyController";

const router = Router();
router.post("/", classifyInput);
export default router;