import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";
import { useTranslation } from "react-i18next";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { HashIcon, PlusIcon, UsersIcon, CalendarIcon } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";
import CustomMessageInput from "../components/CustomMessageInput";
import { useStreami18n } from "../hooks/useStreami18n";
import ScheduleCalendar from "../components/ScheduleCalendar";

const ChatPage = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [channelError, setChannelError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();
  const { streami18n, isReady: isStreami18nReady } = useStreami18n();

  // set active channel from URL params
  useEffect(() => {
    const initChannel = async () => {
      if (!chatClient) return;

      const channelId = searchParams.get("channel");
      if (channelId) {
        try {
          const channel = chatClient.channel("messaging", channelId);
          await channel.watch();
          setActiveChannel(channel);
          setChannelError(null);
        } catch (err) {
          console.error("Channel access error:", err);
          setChannelError(t("chat.error.channel_not_found"));
          setActiveChannel(null);
          // Clear channel param and redirect to main chat
          setSearchParams({});
        }
      } else {
        setChannelError(null);
      }
    };

    initChannel();
  }, [chatClient, searchParams, t, setSearchParams]);

  // todo: handle this with a better component
  if (error) return <p>{t("chat.error.generic")}</p>;
  if (isLoading || !chatClient || !isStreami18nReady) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient} i18nInstance={streami18n}>
        <div className="chat-container">
          {/* LEFT SIDEBAR */}
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              {/* HEADER */}
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <img src="/logo.png" alt="Logo" className="brand-logo" />
                  <span className="brand-name">TeacherHub</span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
              </div>
              {/* CHANNELS LIST */}
              <div className="team-channel-list__content">
                <div className="create-channel-section">
                  <button onClick={() => setIsCreateModalOpen(true)} className="create-channel-btn">
                    <PlusIcon className="size-4" />
                    <span>{t("chat.create_channel")}</span>
                  </button>
                </div>

                {/* CHANNEL LIST */}
                <ChannelList
                  filters={{ members: { $in: [chatClient?.user?.id] } }}
                  options={{ state: true, watch: true }}
                  Preview={({ channel }) => (
                    <CustomChannelPreview
                      channel={channel}
                      activeChannel={activeChannel}
                      setActiveChannel={(channel) => setSearchParams({ channel: channel.id })}
                    />
                  )}
                  List={({ children, loading, error }) => (
                    <div className="channel-sections">
                      <div className="section-header">
                        <div className="section-title">
                          <HashIcon className="size-4" />
                          <span>{t("chat.channels")}</span>
                        </div>
                      </div>

                      {/* todos: add better components here instead of just a simple text  */}
                      {loading && <div className="loading-message">{t("chat.loading_channels")}</div>}
                      {error && <div className="error-message">{t("chat.error.loading_channels")}</div>}

                      <div className="channels-list">{children}</div>

                      <div className="section-header direct-messages">
                        <div className="section-title">
                          <UsersIcon className="size-4" />
                          <span>{t("chat.direct_messages")}</span>
                        </div>
                      </div>
                      <UsersList activeChannel={activeChannel} />

                      {/* SCHEDULE BUTTON */}
                      <div className="schedule-section" style={{ padding: "1rem 1.5rem" }}>
                        <button
                          onClick={() => setIsScheduleViewOpen(true)}
                          className="create-channel-btn"
                          style={{ background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)" }}
                        >
                          <CalendarIcon className="size-4" />
                          <span>{t("schedule.title")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER */}
          <div className="chat-main">
            <Channel channel={activeChannel}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageInput />
                {/* <MessageInput Input={CustomMessageInput} /> */}
              </Window>

              <Thread />
            </Channel>
          </div>
        </div>

        {isCreateModalOpen && <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />}

        {/* SCHEDULE CALENDAR VIEW */}
        {isScheduleViewOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
              <ScheduleCalendar onClose={() => setIsScheduleViewOpen(false)} />
            </div>
          </div>
        )}
      </Chat>
    </div>
  );
};
export default ChatPage;
