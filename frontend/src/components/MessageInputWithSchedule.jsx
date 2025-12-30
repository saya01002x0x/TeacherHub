import { CalendarIcon } from "lucide-react";
import { MessageInput } from "stream-chat-react";
import { useTranslation } from "react-i18next";

const MessageInputWithSchedule = ({ showSchedule, setShowSchedule }) => {
    const { t } = useTranslation();

    return (
        <div style={{ position: 'relative' }}>
            {/* Calendar Button Overlay */}
            <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                style={{
                    position: 'absolute',
                    left: '8px',
                    bottom: '8px',
                    zIndex: 10,
                }}
                title={t("schedule.title") || "Schedule"}
            >
                <CalendarIcon className={`w-6 h-6 ${showSchedule ? 'text-blue-600' : ''}`} />
            </button>

            {/* Default MessageInput with left padding to avoid overlap */}
            <div style={{ paddingLeft: '44px' }}>
                <MessageInput />
            </div>
        </div>
    );
};

export default MessageInputWithSchedule;
