import { HashIcon, LockIcon, UserIcon } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel.data.member_count === 2;
  const isPrivate = channel.data.private;
  
  const unreadCount = channel.countUnread();

  // For direct messages, show user avatar and name
  if (isDM) {
    const otherMember = Object.values(channel.state.members || {}).find(
      member => member.user?.id !== channel._client?.user?.id
    );
    
    const displayName = otherMember?.user?.name || otherMember?.user?.id || 'Unknown';
    const avatarUrl = otherMember?.user?.image;

    return (
      <button
        onClick={() => setActiveChannel(channel)}
        className={`flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 font-medium hover:bg-blue-50/80 min-h-9 transition-colors ${
          isActive
            ? "bg-blue-100 text-blue-900 border-l-4 border-blue-500 shadow-sm"
            : "text-gray-700"
        }`}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-6 h-6 rounded-full mr-3"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
            <UserIcon className="w-3 h-3 text-gray-600" />
          </div>
        )}
        
        <span className="flex-1 truncate">{displayName}</span>

        {unreadCount > 0 && (
          <span className="flex items-center justify-center ml-2 min-w-[16px] h-4 px-1 text-xs rounded-full bg-red-500 text-white">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // For channels, show hash or lock icon
  return (
    <button
      onClick={() => setActiveChannel(channel)}
      className={`flex items-center w-full text-left px-4 py-2 rounded-lg mb-1 font-medium hover:bg-blue-50/80 min-h-9 transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-900 border-l-4 border-blue-500 shadow-sm"
          : "text-gray-700"
      }`}
    >
      {isPrivate ? (
        <LockIcon className="w-4 h-4 text-gray-500 mr-3" />
      ) : (
        <HashIcon className="w-4 h-4 text-gray-500 mr-3" />
      )}
      
      <span className="flex-1 truncate">{channel.data.name || channel.id}</span>

      {unreadCount > 0 && (
        <span className="flex items-center justify-center ml-2 min-w-[16px] h-4 px-1 text-xs rounded-full bg-red-500 text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default CustomChannelPreview;