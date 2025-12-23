import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleCreationModal from "./ScheduleCreationModal";
import ScheduleDetailModal from "./ScheduleDetailModal";
import ScheduleDeleteConfirmModal from "./ScheduleDeleteConfirmModal";

const ScheduleCalendar = ({ onClose }) => {
    const { t } = useTranslation();
    const { schedules, fetchSchedules, createSchedule, deleteSchedule, isLoading } = useSchedules();

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(now.setDate(diff));
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Time slots (9:00 to 18:00)
    const timeSlots = Array.from({ length: 10 }, (_, i) => {
        const hour = 9 + i;
        return `${hour.toString().padStart(2, "0")}:00`;
    });

    // Get week days
    const getWeekDays = useCallback(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentWeekStart]);

    const weekDays = getWeekDays();

    // Fetch schedules for current week
    useEffect(() => {
        const startDate = new Date(currentWeekStart);
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        fetchSchedules(startDate, endDate);
    }, [currentWeekStart, fetchSchedules]);

    const navigateWeek = (direction) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    // Get locale based on current language
    const getLocale = () => {
        const lang = t("locale", { defaultValue: "" });
        if (lang) return lang;
        // Fallback based on i18n language
        const i18nLang = window.localStorage.getItem("i18nextLng") || "ja";
        return i18nLang === "vi" ? "vi-VN" : "ja-JP";
    };

    const formatMonthYear = () => {
        return currentWeekStart.toLocaleDateString(getLocale(), {
            year: "numeric",
            month: "long",
        });
    };

    const getDayName = (date) => {
        return date.toLocaleDateString(getLocale(), { weekday: "short" });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Get schedules for a specific day
    const getSchedulesForDay = (date) => {
        return schedules.filter((schedule) => {
            const scheduleDate = new Date(schedule.date);
            return scheduleDate.toDateString() === date.toDateString();
        });
    };

    // Calculate schedule block position
    const getScheduleStyle = (schedule) => {
        const [startH, startM] = schedule.startTime.split(":").map(Number);
        const [endH, endM] = schedule.endTime.split(":").map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const slotStartMinutes = 9 * 60; // 9:00

        const topOffset = ((startMinutes - slotStartMinutes) / 60) * 60; // 60px per hour
        const height = ((endMinutes - startMinutes) / 60) * 60;

        return {
            top: `${Math.max(0, topOffset)}px`,
            height: `${Math.max(20, height)}px`,
        };
    };

    const handleCreateSchedule = async (data) => {
        await createSchedule(data);
        // Refresh schedules
        const startDate = new Date(currentWeekStart);
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        fetchSchedules(startDate, endDate);
    };

    const handleDeleteSchedule = async () => {
        if (!scheduleToDelete) return;

        setIsDeleting(true);
        try {
            await deleteSchedule(scheduleToDelete._id);
            setScheduleToDelete(null);
            setSelectedSchedule(null);
        } catch (error) {
            console.error("Error deleting schedule:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="schedule-calendar bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 min-w-[150px] text-center">
                        {formatMonthYear()}
                    </h2>
                    <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {t("schedule.new_schedule")}
                    </button>

                    {selectedSchedule && (
                        <button
                            onClick={() => setScheduleToDelete(selectedSchedule)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            <Trash2Icon className="w-4 h-4" />
                            {t("schedule.delete_button")}
                        </button>
                    )}

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            {t("common.close") || "閉じる"}
                        </button>
                    )}
                </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-[800px]">
                    {/* Day headers */}
                    <div className="grid grid-cols-8 border-b sticky top-0 bg-white z-10">
                        <div className="p-3 border-r text-sm font-medium text-gray-500">
                            {t("schedule.time_label") || "時間"}
                        </div>
                        {weekDays.map((day, index) => (
                            <div
                                key={index}
                                className={`p-3 text-center border-r ${isToday(day) ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="text-sm text-gray-500">{getDayName(day)}</div>
                                <div
                                    className={`text-lg font-semibold ${isToday(day)
                                        ? "text-blue-600 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                                        : "text-gray-800"
                                        }`}
                                >
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time grid */}
                    <div className="relative">
                        {timeSlots.map((time, timeIndex) => (
                            <div key={time} className="grid grid-cols-8 border-b" style={{ height: "60px" }}>
                                <div className="p-2 border-r text-sm text-gray-500 text-right pr-3">
                                    {time}
                                </div>
                                {weekDays.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`border-r relative ${isToday(day) ? "bg-blue-50/50" : ""
                                            }`}
                                    >
                                        {/* Render schedules for this time slot */}
                                        {timeIndex === 0 &&
                                            getSchedulesForDay(day).map((schedule) => (
                                                <div
                                                    key={schedule._id}
                                                    onClick={() => setSelectedSchedule(schedule)}
                                                    style={getScheduleStyle(schedule)}
                                                    className={`absolute left-1 right-1 px-2 py-1 rounded text-xs cursor-pointer transition-all overflow-hidden ${selectedSchedule?._id === schedule._id
                                                        ? "bg-blue-600 text-white ring-2 ring-blue-300 z-20"
                                                        : "bg-blue-100 text-blue-800 hover:bg-blue-200 z-10"
                                                        }`}
                                                >
                                                    <div className="font-medium truncate">{schedule.title}</div>
                                                    <div className="text-[10px] opacity-75">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <ScheduleCreationModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSchedule}
                />
            )}

            {selectedSchedule && !scheduleToDelete && (
                <ScheduleDetailModal
                    schedule={selectedSchedule}
                    onClose={() => setSelectedSchedule(null)}
                />
            )}

            {scheduleToDelete && (
                <ScheduleDeleteConfirmModal
                    schedule={scheduleToDelete}
                    onConfirm={handleDeleteSchedule}
                    onCancel={() => setScheduleToDelete(null)}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
};

export default ScheduleCalendar;
