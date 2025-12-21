import { XIcon, CalendarIcon, ClockIcon, UsersIcon, FileTextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const ScheduleDetailModal = ({ schedule, onClose }) => {
    const { t } = useTranslation();

    if (!schedule) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800 truncate pr-4">
                        {schedule.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors flex-shrink-0"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* DATE */}
                    <div className="flex items-start gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                {t("schedule.date_label")}
                            </p>
                            <p className="text-gray-800">{formatDate(schedule.date)}</p>
                        </div>
                    </div>

                    {/* TIME */}
                    <div className="flex items-start gap-3">
                        <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                {t("schedule.time_label")}
                            </p>
                            <p className="text-gray-800">
                                {schedule.startTime} 〜 {schedule.endTime}
                            </p>
                        </div>
                    </div>

                    {/* PARTICIPANTS */}
                    {schedule.participants && schedule.participants.length > 0 && (
                        <div className="flex items-start gap-3">
                            <UsersIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {t("schedule.participants_label")}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {schedule.participants.map((participant) => (
                                        <div
                                            key={participant.clerkId}
                                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm"
                                        >
                                            {participant.image && (
                                                <img
                                                    src={participant.image}
                                                    alt={participant.name}
                                                    className="w-5 h-5 rounded-full"
                                                />
                                            )}
                                            <span className="text-gray-700">{participant.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAILS */}
                    {schedule.details && (
                        <div className="flex items-start gap-3">
                            <FileTextIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    {t("schedule.details_label")}
                                </p>
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {schedule.details}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                    >
                        {t("common.close") || "閉じる"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetailModal;
