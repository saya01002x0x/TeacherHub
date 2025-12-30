import { XIcon } from "lucide-react";
import ScheduleCalendar from "./ScheduleCalendar";

const ScheduleListModal = ({ channelId, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden h-[80vh] flex flex-col">
                {/* We can rely on ScheduleCalendar's internal header, but we need to ensure the close button there works or we wrap it here.
                    ScheduleCalendar has its own header with close button that calls onClose. 
                    So we just render ScheduleCalendar here. 
                    However, allow ScheduleCalendar to take full height.
                */}
                <div className="relative flex-1 h-full w-full">
                    <ScheduleCalendar channelId={channelId} onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

export default ScheduleListModal;
