import {
    SendButton,
    useMessageInputContext,
    useChannelStateContext,
    useChatContext
} from "stream-chat-react";
import { VoteIcon, PaperclipIcon } from "lucide-react";
import { useState } from "react";
import PollCreationModal from "./PollCreationModal";

const CustomMessageInput = () => {
    const { text, handleChange, handleSubmit } = useMessageInputContext();
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);

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

    return (
        <div className="str-chat__input-flat str-chat__input-flat--send-button-active">
            <div className="str-chat__input-flat-wrapper">
                <div className="flex items-center p-2 bg-white border-t border-gray-200">
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setIsPollModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors mr-2"
                        title="Create Poll"
                    >
                        <VoteIcon className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            className="w-full max-h-40 min-h-[40px] p-2 focus:outline-none resize-none text-gray-700 placeholder-gray-400 bg-transparent"
                            rows={1}
                            value={text}
                            onChange={handleChange}
                            placeholder="Send a message"
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
        </div>
    );
};

export default CustomMessageInput;
