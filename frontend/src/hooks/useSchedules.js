import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

export const useSchedules = (channelId) => {
    const { getToken } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthHeaders = async () => {
        const token = await getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const fetchSchedules = useCallback(
        async (startDate, endDate) => {
            if (!channelId) {
                console.warn("No channelId provided to fetchSchedules");
                return [];
            }

            setIsLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                const params = new URLSearchParams();
                params.append("channelId", channelId);
                if (startDate) params.append("startDate", startDate.toISOString());
                if (endDate) params.append("endDate", endDate.toISOString());

                const response = await axios.get(
                    `${API_BASE_URL}/schedules?${params.toString()}`,
                    { headers }
                );
                setSchedules(response.data);
                return response.data;
            } catch (err) {
                console.error("Error fetching schedules:", err);
                setError(err.response?.data?.error || "Failed to fetch schedules");
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [getToken, channelId]
    );

    const createSchedule = useCallback(
        async (scheduleData) => {
            if (!channelId) {
                throw new Error("channelId is required");
            }

            setIsLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                const response = await axios.post(
                    `${API_BASE_URL}/schedules`,
                    { ...scheduleData, channelId },
                    { headers }
                );
                setSchedules((prev) => [...prev, response.data]);
                return response.data;
            } catch (err) {
                console.error("Error creating schedule:", err);
                const errorMessage = err.response?.data?.error || "Failed to create schedule";
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [getToken, channelId]
    );

    const getScheduleById = useCallback(
        async (id) => {
            setIsLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                const response = await axios.get(`${API_BASE_URL}/schedules/${id}`, {
                    headers,
                });
                return response.data;
            } catch (err) {
                console.error("Error fetching schedule:", err);
                setError(err.response?.data?.error || "Failed to fetch schedule");
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [getToken]
    );

    const deleteSchedule = useCallback(
        async (id) => {
            setIsLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                await axios.delete(`${API_BASE_URL}/schedules/${id}`, { headers });
                setSchedules((prev) => prev.filter((s) => s._id !== id));
                return true;
            } catch (err) {
                console.error("Error deleting schedule:", err);
                setError(err.response?.data?.error || "Failed to delete schedule");
                throw new Error(err.response?.data?.error || "Failed to delete schedule");
            } finally {
                setIsLoading(false);
            }
        },
        [getToken]
    );

    return {
        schedules,
        isLoading,
        error,
        fetchSchedules,
        createSchedule,
        getScheduleById,
        deleteSchedule,
    };
};
