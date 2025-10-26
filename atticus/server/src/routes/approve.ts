import { Router } from "express";
import { createApprovalController, updateApproval } from "../controllers/approvalController";

const router = Router();

router.post("/", createApprovalController);       // Create a new approval
router.patch("/:id", updateApproval);             // Update an approval (status change)

export default router;
