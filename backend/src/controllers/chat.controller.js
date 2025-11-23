import { generateStreamToken, streamClient } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.auth().userId);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error generating Stream token:", error);
    res.status(500).json({
      message: "Failed to generate Stream token",
    });
  }
};

export const getChannels = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { 
      limit = 20, 
      offset = 0, 
      sort = "last_message_at",
      order = -1 
    } = req.query;

    // Filter channels that user is a member of
    const filter = {
      members: { $in: [userId] },
    };

    // Sort options
    const sortOptions = {};
    if (sort === "created_at") {
      sortOptions.created_at = parseInt(order);
    } else if (sort === "last_message_at") {
      sortOptions.last_message_at = parseInt(order);
    } else {
      sortOptions.last_message_at = -1; // Default: newest messages first
    }

    // Query channels from Stream
    const channels = await streamClient.queryChannels(
      filter,
      sortOptions,
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
        state: true, // Include channel state
        watch: false, // Don't watch for updates
        presence: false, // Don't include presence data
      }
    );

    // Format response with metadata
    const channelsData = channels.map((channel) => ({
      id: channel.id,
      type: channel.type,
      name: channel.data?.name || "",
      image: channel.data?.image || "",
      description: channel.data?.description || "",
      created_at: channel.created_at,
      updated_at: channel.updated_at,
      last_message_at: channel.state?.last_message_at || null,
      member_count: channel.state?.member_count || 0,
      unread_count: channel.state?.unreadCount || 0,
      metadata: channel.data || {},
    }));

    res.status(200).json({
      channels: channelsData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: channelsData.length,
        has_more: channelsData.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.log("Error querying channels:", error);
    res.status(500).json({
      message: "Failed to query channels",
      error: error.message,
    });
  }
};

// Lấy tin nhắn của kênh
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const {
      limit = 20,
      offset = 0,
      sort = "desc", // desc: mới nhất trước, asc: cũ nhất trước
    } = req.query;

    // Validate channelId
    if (!channelId || typeof channelId !== "string" || channelId.trim() === "") {
      return res.status(400).json({
        message: "channelId is required and must be a non-empty string",
      });
    }

    // Lấy channel từ Stream (mặc định type là 'messaging')
    const channel = streamClient.channel("messaging", channelId);

    // Watch channel để đảm bảo channel tồn tại
    await channel.watch();

    // Query messages từ Stream với pagination
    const messagesResponse = await channel.query({
      messages: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });

    // Lấy messages từ response
    let messages = messagesResponse.messages || [];

    // Sort theo thời gian (mặc định: mới nhất trước)
    if (sort === "asc") {
      messages = messages.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeA - timeB; // Cũ nhất trước
      });
    } else {
      // desc: mới nhất trước (default)
      messages = messages.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA; // Mới nhất trước
      });
    }

    // Format messages
    const messagesData = messages.map((message) => ({
      id: message.id,
      text: message.text || "",
      user: {
        id: message.user?.id || "",
        name: message.user?.name || "",
        image: message.user?.image || "",
      },
      created_at: message.created_at,
      updated_at: message.updated_at,
      attachments: message.attachments || [],
      reply_count: message.reply_count || 0,
      type: message.type || "regular",
    }));

    // Tính toán pagination
    const totalMessages = messagesResponse.messages?.length || 0;
    const hasMore = totalMessages === parseInt(limit);

    res.status(200).json({
      messages: messagesData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalMessages,
        has_more: hasMore,
      },
    });
  } catch (error) {
    console.log("Error getting messages:", error);

    // Xử lý các error cases cụ thể
    if (error.message?.includes("channel") || error.message?.includes("not found")) {
      return res.status(404).json({
        message: "Channel not found",
        error: error.message,
      });
    }

    if (error.message?.includes("permission") || error.message?.includes("forbidden")) {
      return res.status(403).json({
        message: "Permission denied",
        error: error.message,
      });
    }

    // Generic error
    res.status(500).json({
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
  try {
    const { channelId, text, userId } = req.body;

    // Validate input
    if (!channelId || typeof channelId !== "string" || channelId.trim() === "") {
      return res.status(400).json({
        message: "channelId is required and must be a non-empty string",
      });
    }

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        message: "text is required and must be a non-empty string",
      });
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({
        message: "userId is required and must be a non-empty string",
      });
    }

    // Lấy channel từ Stream (mặc định type là 'messaging')
    const channel = streamClient.channel("messaging", channelId);

    // Watch channel để đảm bảo channel tồn tại
    await channel.watch();

    // Gửi message qua Stream SDK
    // Stream SDK sẽ tự động kiểm tra quyền của user
    const message = await channel.sendMessage({
      text: text.trim(),
      user: {
        id: userId,
      },
    });

    // Format và return message đã gửi
    const messageData = {
      id: message.message.id,
      text: message.message.text,
      user: {
        id: message.message.user.id,
        name: message.message.user.name || "",
        image: message.message.user.image || "",
      },
      created_at: message.message.created_at,
      updated_at: message.message.updated_at,
      channel_id: channelId,
      attachments: message.message.attachments || [],
      reply_count: message.message.reply_count || 0,
      type: message.message.type || "regular",
    };

    res.status(201).json({
      message: messageData,
    });
  } catch (error) {
    console.log("Error sending message:", error);

    // Xử lý các error cases cụ thể
    if (error.message?.includes("channel") || error.message?.includes("not found")) {
      return res.status(404).json({
        message: "Channel not found",
        error: error.message,
      });
    }

    if (error.message?.includes("permission") || error.message?.includes("forbidden")) {
      return res.status(403).json({
        message: "Permission denied",
        error: error.message,
      });
    }

    // Generic error
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

