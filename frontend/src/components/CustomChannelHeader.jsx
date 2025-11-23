import { HashIcon, LockIcon, UsersIcon } from "lucide-react";

const CustomChannelHeader = ({ channel }) => {
  // Default values for when no channel is selected
  if (!channel) {
    return (
      <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-white">
        <div className="flex items-center gap-2">
          <HashIcon className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-500">Select a channel</span>
        </div>
      </div>
    );
  }

  const isPrivate = channel.data?.private;
  const channelName = channel.data?.name || channel.id;
  const memberCount = channel.data?.member_count || 0;

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white">
      {/* Left side - Channel info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          {isPrivate ? (
            <LockIcon className="w-5 h-5 text-gray-500 shrink-0" />
          ) : (
            <HashIcon className="w-5 h-5 text-gray-500 shrink-0" />
          )}
          
          <h2 className="font-semibold text-gray-900 truncate text-lg md:text-xl">
            {channelName}
          </h2>
        </div>
      </div>

      {/* Right side - Member count */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-150 transition-colors">
          <UsersIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {memberCount}
          </span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomChannelHeader;