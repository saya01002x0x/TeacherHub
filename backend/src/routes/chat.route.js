import express from "express";
import { getStreamToken, getChannels, getMessages, sendMessage } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/channels", protectRoute, getChannels);
router.get("/messages/:channelId", protectRoute, getMessages);
router.post("/messages", protectRoute, sendMessage);

export default router;

