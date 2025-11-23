import { useState } from "react";
import { X, Hash, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Optional Stream Chat import
let useChatContext = null;
try {
  const streamChat = require("stream-chat-react");
  useChatContext = streamChat.useChatContext;
} catch (e) {
  // Stream Chat not available, will use mock mode
}

const CreateChannelModal = ({ onClose, onCreateChannel }) => {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [channelType, setChannelType] = useState("public");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Try to get Stream Chat context if available (only if hook exists and context is set up)
  let chatContext = null;
  if (useChatContext) {
    try {
      chatContext = useChatContext();
    } catch (e) {
      // Context not available, continue without it
      console.log("Stream Chat context not available, using mock mode");
    }
  }

  // Validate channel name
  const validateName = (name) => {
    if (!name.trim()) return "Channel name is required";
    if (name.length < 3) return "Channel name must be at least 3 characters";
    if (name.length > 22) return "Channel name must be less than 22 characters";
    return "";
  };

  // Tạo slug cho channel ID
  const slugify = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 20);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMsg = validateName(channelName);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const channelId = slugify(channelName);
      const channelData = {
        id: channelId,
        name: channelName.trim(),
        description,
        private: channelType === "private",
        member_count: 1, // Creator is the first member
      };

      // If Stream Chat is available, use it
      if (chatContext?.client?.user) {
        const streamChannelData = {
          name: channelName.trim(),
          created_by_id: chatContext.client.user.id,
          description,
          private: channelType === "private",
          visibility: channelType === "private" ? "private" : "public",
          discoverable: channelType === "public",
          members: [chatContext.client.user.id],
        };

        const channel = chatContext.client.channel("messaging", channelId, streamChannelData);
        await channel.watch();

        if (chatContext.setActiveChannel) {
          chatContext.setActiveChannel(channel);
        }
      }

      // Call custom handler if provided (for mock/alternative implementation)
      if (onCreateChannel) {
        await onCreateChannel(channelData);
      }

      toast.success(`Channel "${channelName}" đã được tạo!`);
      onClose();
    } catch (err) {
      console.error("Error creating channel:", err);
      setError("Không thể tạo channel. Vui lòng thử lại.");
      toast.error("Không thể tạo channel.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Tạo Channel mới</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Channel name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Channel
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={channelName}
                onChange={(e) => {
                  setChannelName(e.target.value);
                  setError(validateName(e.target.value));
                }}
                placeholder="Nhập tên channel"
                maxLength={22}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {channelName && (
              <div className="mt-2 text-sm text-gray-500">
                Channel ID: <strong className="text-indigo-600">#{slugify(channelName)}</strong>
              </div>
            )}
          </div>

          {/* Channel type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại Channel
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all flex-1 hover:bg-gray-50">
                <input
                  type="radio"
                  value="public"
                  checked={channelType === "public"}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Hash size={18} className="text-gray-600" />
                <span className="font-medium text-gray-700">Public</span>
              </label>

              <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all flex-1 hover:bg-gray-50">
                <input
                  type="radio"
                  value="private"
                  checked={channelType === "private"}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Lock size={18} className="text-gray-600" />
                <span className="font-medium text-gray-700">Private</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Channel này dùng để làm gì?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!channelName.trim() || isCreating}
            >
              {isCreating ? "Đang tạo..." : "Tạo Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
