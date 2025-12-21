import { useState, useEffect } from "react";
import { XIcon, CalendarIcon, ClockIcon, UsersIcon, FileTextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChatContext } from "stream-chat-react";

const ScheduleCreationModal = ({ onClose, onSubmit }) => {
    const { t } = useTranslation();
    const { client } = useChatContext();

    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [details, setDetails] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // User search
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Set default date to today
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        setDate(formattedDate);
    }, []);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (!client || searchQuery.length < 1) {
                setUsers([]);
                return;
            }

            setIsLoadingUsers(true);
            try {
                const response = await client.queryUsers(
                    {
                        $or: [
                            { name: { $autocomplete: searchQuery } },
                            { id: { $autocomplete: searchQuery } },
                        ],
                        id: { $ne: client.userID },
                    },
                    { name: 1 },
                    { limit: 10 }
                );
                // Filter out already selected participants
                const filtered = response.users.filter(
                    (user) => !selectedParticipants.some((p) => p.clerkId === user.id)
                );
                setUsers(filtered);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, client, selectedParticipants]);

    const validate = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = t("schedule.validation.title_required");
        } else if (title.length > 255) {
            newErrors.title = t("schedule.validation.title_max_length");
        }

        if (!date) {
            newErrors.date = t("schedule.validation.date_required");
        }

        if (!startTime || !endTime) {
            newErrors.time = t("schedule.validation.time_required");
        } else {
            const [startH, startM] = startTime.split(":").map(Number);
            const [endH, endM] = endTime.split(":").map(Number);
            if (endH * 60 + endM <= startH * 60 + startM) {
                newErrors.time = t("schedule.validation.end_after_start");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddParticipant = (user) => {
        setSelectedParticipants([
            ...selectedParticipants,
            {
                clerkId: user.id,
                name: user.name || user.id,
                image: user.image,
            },
        ]);
        setSearchQuery("");
        setUsers([]);
    };

    const handleRemoveParticipant = (clerkId) => {
        setSelectedParticipants(selectedParticipants.filter((p) => p.clerkId !== clerkId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await onSubmit({
                title: title.trim(),
                date,
                startTime,
                endTime,
                participants: selectedParticipants,
                details: details.trim(),
            });
            onClose();
        } catch (error) {
            console.error("Error creating schedule:", error);
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {t("schedule.create_title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ERROR MESSAGE */}
                        {errors.submit && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* TITLE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("schedule.title_label")}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("schedule.title_placeholder")}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.title ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* DATE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <CalendarIcon className="inline w-4 h-4 mr-1" />
                                {t("schedule.date_label")}
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.date ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {errors.date && (
                                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                            )}
                        </div>

                        {/* TIME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <ClockIcon className="inline w-4 h-4 mr-1" />
                                {t("schedule.time_label")}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <span className="text-gray-500">〜</span>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            {errors.time && (
                                <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                            )}
                        </div>

                        {/* PARTICIPANTS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <UsersIcon className="inline w-4 h-4 mr-1" />
                                {t("schedule.participants_label")}
                            </label>

                            {/* Selected participants */}
                            {selectedParticipants.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedParticipants.map((participant) => (
                                        <div
                                            key={participant.clerkId}
                                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                                        >
                                            {participant.image && (
                                                <img
                                                    src={participant.image}
                                                    alt={participant.name}
                                                    className="w-5 h-5 rounded-full"
                                                />
                                            )}
                                            <span>{participant.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveParticipant(participant.clerkId)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t("schedule.participants_placeholder")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />

                                {/* Search results dropdown */}
                                {(users.length > 0 || isLoadingUsers) && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {isLoadingUsers ? (
                                            <div className="p-3 text-gray-500 text-sm">
                                                {t("modal.create_channel.members.loading")}
                                            </div>
                                        ) : (
                                            users.map((user) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => handleAddParticipant(user)}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    {user.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                                            {(user.name || user.id).charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-gray-800">{user.name || user.id}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FileTextIcon className="inline w-4 h-4 mr-1" />
                                {t("schedule.details_label")}
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder={t("schedule.details_placeholder")}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                disabled={isLoading}
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-70 flex items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? t("common.creating") : t("schedule.create_button")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCreationModal;
