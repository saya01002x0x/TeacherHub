import { Schedule } from "../models/schedule.model.js";
import { getAuth } from "@clerk/express";

// Create a new schedule
export const createSchedule = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { title, date, startTime, endTime, participants, details, recurrence, channelId } = req.body;

        // Validate required fields
        if (!title || !date || !startTime || !endTime || !channelId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate title length
        if (title.length < 1 || title.length > 255) {
            return res.status(400).json({ error: "Title must be 1-255 characters" });
        }

        const schedule = new Schedule({
            title,
            date: new Date(date),
            startTime,
            endTime,
            participants: participants || [],
            details: details || "",
            createdBy: userId,
            channelId,
            recurrence: recurrence || "none",
        });

        await schedule.save();

        res.status(201).json(schedule);
    } catch (error) {
        console.error("Error creating schedule:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to create schedule" });
    }
};

// Get schedules for the authenticated user and channel
export const getSchedules = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { startDate, endDate, channelId } = req.query;

        if (!channelId) {
            return res.status(400).json({ error: "channelId is required" });
        }

        let query = {
            channelId,
            $or: [
                { createdBy: userId },
                { "participants.clerkId": userId },
            ],
        };

        // Filter by date range if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const schedules = await Schedule.find(query).sort({ date: 1, startTime: 1 });

        res.status(200).json(schedules);
    } catch (error) {
        console.error("Error getting schedules:", error);
        res.status(500).json({ error: "Failed to get schedules" });
    }
};

// Get a single schedule by ID
export const getScheduleById = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params;
        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        // Check if user has access to this schedule
        const isCreator = schedule.createdBy === userId;
        const isParticipant = schedule.participants.some((p) => p.clerkId === userId);

        if (!isCreator && !isParticipant) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error("Error getting schedule:", error);
        res.status(500).json({ error: "Failed to get schedule" });
    }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params;
        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        // Only the creator can delete
        if (schedule.createdBy !== userId) {
            return res.status(403).json({ error: "Only the creator can delete this schedule" });
        }

        await Schedule.findByIdAndDelete(id);

        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ error: "Failed to delete schedule" });
    }
};
