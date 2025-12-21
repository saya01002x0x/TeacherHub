import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255,
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
        },
        endTime: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
        },
        participants: [
            {
                clerkId: {
                    type: String,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                image: {
                    type: String,
                },
            },
        ],
        details: {
            type: String,
            default: "",
        },
        createdBy: {
            type: String,
            required: true,
        },
        recurrence: {
            type: String,
            enum: ["none", "daily", "weekly", "monthly"],
            default: "none",
        },
    },
    { timestamps: true }
);

// Validate that endTime is after startTime
scheduleSchema.pre("validate", function (next) {
    if (this.startTime && this.endTime) {
        const [startHour, startMin] = this.startTime.split(":").map(Number);
        const [endHour, endMin] = this.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            this.invalidate("endTime", "End time must be after start time");
        }
    }
    next();
});

export const Schedule = mongoose.model("Schedule", scheduleSchema);
