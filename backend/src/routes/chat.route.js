import express from "express";
import { getStreamToken, sendSystemMessage } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/channel/system-message", protectRoute, sendSystemMessage);

export default router;
