import { generateStreamToken, streamClient, upsertStreamUser } from "../config/stream.js";

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

export const createChannel = async (req, res) => {
  try {
    const { name, description, type = "team", members = [] } = req.body;
    const userId = req.auth().userId;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Channel name is required" });
    }

    // Ensure creator is in members
    const channelMembers = [...new Set([userId, ...members])];

    // Upsert users on Stream before creating channel
    for (const memberId of channelMembers) {
      await upsertStreamUser({ id: memberId, name: `User ${memberId}` });
    }

    const channelData = {
      name: name.trim(),
      description: description?.trim() || "",
      members: channelMembers,
      created_by_id: userId,
    };

    // Create channel on Stream
    const channel = streamClient.channel(type, null, channelData);
    const createdChannel = await channel.create();

    res.status(201).json({
      message: "Channel created successfully",
      channel: {
        id: createdChannel.channel.id,
        type: createdChannel.channel.type,
        name: createdChannel.channel.data.name,
        description: createdChannel.channel.data.description,
        members: createdChannel.channel.state.members,
        created_at: createdChannel.channel.created_at,
        created_by_id: createdChannel.channel.data.created_by_id,
      },
    });
  } catch (error) {
    console.log("Error creating channel:", error);
    res.status(500).json({
      message: "Failed to create channel",
      error: error.message,
    });
  }
};

export const addMembersToChannel = async (req, res) => {
  try {
    const { channelId, members } = req.body;
    const userId = req.auth().userId;

    if (!channelId || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Channel ID and members array are required" });
    }

    // Get the channel
    const channel = streamClient.channel("team", channelId);

    // Check if user is a member of the channel
    const channelState = await channel.query();
    if (!channelState.members.some(member => member.user_id === userId)) {
      return res.status(403).json({ message: "You are not a member of this channel" });
    }

    // Add members
    await channel.addMembers(members);

    // Get updated channel state
    const updatedChannel = await channel.query();

    res.status(200).json({
      message: "Members added successfully",
      channel: {
        id: updatedChannel.channel.id,
        members: updatedChannel.members,
      },
    });
  } catch (error) {
    console.log("Error adding members to channel:", error);
    res.status(500).json({
      message: "Failed to add members to channel",
      error: error.message,
    });
  }
};

export const getChannelMembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.auth().userId;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    // Get the channel
    const channel = streamClient.channel("team", channelId);

    // Check if user is a member of the channel
    const channelState = await channel.query();
    if (!channelState.members.some(member => member.user_id === userId)) {
      return res.status(403).json({ message: "You are not a member of this channel" });
    }

    // Get members
    const members = channelState.members.map(member => ({
      user_id: member.user_id,
      user: member.user,
      role: member.role,
      invited_at: member.invited_at,
      joined_at: member.joined_at,
    }));

    res.status(200).json({
      channelId,
      members,
      member_count: members.length,
    });
  } catch (error) {
    console.log("Error getting channel members:", error);
    res.status(500).json({
      message: "Failed to get channel members",
      error: error.message,
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

// Tạo cuộc trò chuyện riêng tư (Direct Message)
export const createDirectMessage = async (req, res) => {
  try {
    const { member, description } = req.body;
    const userId = req.auth().userId;

    // Validate input
    if (!member || typeof member !== "string" || member.trim() === "") {
      return res.status(400).json({
        message: "member is required and must be a non-empty string",
      });
    }

    // Không được tạo DM với chính mình
    if (member === userId) {
      return res.status(400).json({
        message: "Cannot create direct message with yourself",
      });
    }

    // Tạo channel ID từ 2 user IDs (giống code mẫu)
    // Sort để đảm bảo channel ID giống nhau dù user nào tạo
    const channelId = [userId, member].sort().join("-").slice(0, 64);

    // Đảm bảo cả 2 users đều được upsert trên Stream
    await upsertStreamUser({ id: userId, name: `User ${userId}` });
    await upsertStreamUser({ id: member, name: `User ${member}` });

    // Tạo channel với members
    // Stream SDK sẽ tự động tạo channel nếu chưa tồn tại khi watch()
    const channel = streamClient.channel("messaging", channelId, {
      members: [userId, member],
      description: description?.trim() || "",
    });

    // Watch channel (sẽ tạo mới nếu chưa tồn tại, hoặc lấy channel đã tồn tại)
    await channel.watch();

    // Query để lấy thông tin đầy đủ của channel
    const channelState = await channel.query();

    // Kiểm tra xem channel vừa được tạo hay đã tồn tại từ trước
    // Nếu created_at gần đây (trong vòng 5 giây) thì có thể là vừa tạo
    const now = new Date().getTime();
    const createdTime = new Date(channelState.channel.created_at).getTime();
    const timeDiff = (now - createdTime) / 1000; // seconds
    const isNewChannel = timeDiff < 5; // Nếu tạo trong vòng 5 giây thì coi là mới

    // Format members
    const membersList = Object.keys(channelState.members || {}).map(memberId => ({
      user_id: memberId,
      user: channelState.members[memberId]?.user || {},
      role: channelState.members[memberId]?.role || "member",
    }));

    // Return response
    if (isNewChannel) {
      res.status(201).json({
        message: "Direct message channel created successfully",
        channel: {
          id: channelState.channel.id,
          type: channelState.channel.type,
          members: membersList,
          member_count: membersList.length,
          description: channelState.channel.data?.description || "",
          created_at: channelState.channel.created_at,
          updated_at: channelState.channel.updated_at,
        },
      });
    } else {
      res.status(200).json({
        message: "Direct message channel already exists",
        channel: {
          id: channelState.channel.id,
          type: channelState.channel.type,
          members: membersList,
          member_count: membersList.length,
          description: channelState.channel.data?.description || "",
          created_at: channelState.channel.created_at,
          updated_at: channelState.channel.updated_at,
        },
      });
    }
  } catch (error) {
    console.log("Error creating direct message:", error);

    // Xử lý các error cases cụ thể
    if (error.message?.includes("user") || error.message?.includes("not found")) {
      return res.status(404).json({
        message: "Member user not found",
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
      message: "Failed to create direct message",
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

