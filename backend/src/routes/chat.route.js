import express from "express";
import { getStreamToken, getChannels } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/channels", protectRoute, getChannels);

export default router;

