import { serve } from "@upstash/ingest/express";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";
import User from "../models/user.model.js";

export const syncUser = async (user) => {
    try {
        // Sync to MongoDB
        const userData = {
            _id: user.id,
            name: user.first_name + " " + user.last_name,
            email: user.email_addresses[0].email_address,
            image: user.image_url,
            clerkId: user.id,
        };

        await User.findOneAndUpdate(
            { clerkId: user.id },
            userData,
            { upsert: true, new: true }
        );

        // Sync to Stream
        const streamUserData = {
            id: user.id,
            name: userData.name,
            image: userData.image,
        };

        await upsertStreamUser(streamUserData);

        console.log("User synced successfully:", user.id);
    } catch (error) {
        console.error("Error syncing user:", error);
    }
};

export const deleteUser = async (userId) => {
    try {
        // Delete from MongoDB
        await User.findOneAndDelete({ clerkId: userId });

        // Delete from Stream
        await deleteStreamUser(userId);

        console.log("User deleted successfully:", userId);
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

// Ingest handlers
export const handleUserCreated = async (user) => {
    await syncUser(user);
};

export const handleUserUpdated = async (user) => {
    await syncUser(user);
};

export const handleUserDeleted = async (userId) => {
    await deleteUser(userId);
};

// Serve ingest endpoint
export const ingestServe = serve({
    "/api/ingest": {
        "user.created": handleUserCreated,
        "user.updated": handleUserUpdated,
        "user.deleted": handleUserDeleted,
    },
});