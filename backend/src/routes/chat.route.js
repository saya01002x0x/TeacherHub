import express from "express";
import {
    getStreamToken,
    getChannels,
    createChannel,
    addMembersToChannel,
    getChannelMembers
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/channels", protectRoute, createChannel);
router.post("/channels/:channelId/members", protectRoute, addMembersToChannel);
router.get("/channels/:channelId/members", protectRoute, getChannelMembers);
router.get("/channels", protectRoute, getChannels);

export default router;