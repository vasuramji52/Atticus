// import { Router } from "express";
// import { classifyInput } from "../controllers/classifyController";

// const router = Router();
// router.post("/", classifyInput);
// export default router;

// server/src/routes/classify.ts
import { Router } from "express";
import { classifyInput } from "../controllers/classifyController";
import { authRequired } from "../middle/authRequired"; // keep the same casing you used in app.ts

const router = Router();

// 🔒 protect the classify endpoint here
router.post("/", authRequired, classifyInput);

export default router;
