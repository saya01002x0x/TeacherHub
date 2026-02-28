import {
    SendButton,
    useMessageInputContext,
    useChannelStateContext,
    useChatContext
} from "stream-chat-react";
import { VoteIcon, PlusIcon, ImageIcon, CalendarIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import PollCreationModal from "./PollCreationModal";
import ScheduleListModal from "./ScheduleListModal";
import { useTranslation } from "react-i18next";

const CustomMessageInput = () => {
    const { t } = useTranslation();
    const { text, handleChange, handleSubmit, openFilePicker } = useMessageInputContext();
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();

    // State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handlePollSubmit = async (pollData) => {
        try {
            // Create the poll using client.createPoll
            const poll = await client.createPoll({
                name: pollData.name,
                options: pollData.options,
                voting_visibility: pollData.voting_visibility || 'public',
                max_votes_allowed: pollData.max_votes_allowed || 1,
                allow_user_suggested_options: pollData.allow_user_suggest || false,
                allow_answers: pollData.allow_answers || true,
            });

            // Send message with poll attachment
            await channel.sendMessage({
                text: pollData.name,
                attachments: [
                    {
                        type: 'poll',
                        poll_id: poll.id,
                    }
                ]
            });
        } catch (err) {
            console.error("Failed to create poll:", err);
            alert("Failed to create poll. Please ensure polls are enabled in your Stream dashboard.");
        }
    };

    const handleMultimediaClick = () => {
        // Trigger file picker from Stream context
        if (openFilePicker) {
            openFilePicker();
        }
        setIsMenuOpen(false);
    };

    return (
        <div className="str-chat__input-flat str-chat__input-flat--send-button-active relative">
            <div className="str-chat__input-flat-wrapper">
                <div className="flex items-center p-2 bg-white border-t border-gray-200">

                    {/* Schedule Button */}
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors mr-2"
                        title={t("schedule.title") || "Schedule"}
                    >
                        <CalendarIcon className="w-5 h-5" />
                    </button>

                    {/* Plus Button with Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className={`p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 ${isMenuOpen ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title={t("common.more_options") || "More options"}
                        >
                            <PlusIcon className="w-5 h-5 transition-transform duration-200" style={{ transform: isMenuOpen ? 'rotate(45deg)' : 'none' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <button
                                    onClick={handleMultimediaClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors text-left"
                                >
                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">Multimedia</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPollModalOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors text-left"
                                >
                                    <VoteIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium">{t("poll.create_title") || "Create Poll"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <textarea
                            className="w-full max-h-40 min-h-[40px] p-2 focus:outline-none resize-none text-gray-700 placeholder-gray-400 bg-transparent"
                            rows={1}
                            value={text}
                            onChange={handleChange}
                            placeholder={t("channel.message_placeholder") || "Send a message"}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                        <SendButton />
                    </div>
                </div>
            </div>

            {isPollModalOpen && (
                <PollCreationModal
                    onClose={() => setIsPollModalOpen(false)}
                    onSubmit={handlePollSubmit}
                />
            )}

            {isScheduleModalOpen && (
                <ScheduleListModal
                    channelId={channel?.id}
                    onClose={() => setIsScheduleModalOpen(false)}
                />
            )}
        </div>
    );
};

export default CustomMessageInput;
