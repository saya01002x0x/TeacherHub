import express from "express";
import { requireAuth } from "@clerk/express";
import {
    createSchedule,
    getSchedules,
    getScheduleById,
    deleteSchedule,
} from "../controllers/schedule.controller.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth());

// Create a new schedule
router.post("/", createSchedule);

// Get all schedules for the authenticated user
router.get("/", getSchedules);

// Get a single schedule by ID
router.get("/:id", getScheduleById);

// Delete a schedule
router.delete("/:id", deleteSchedule);

export default router;
