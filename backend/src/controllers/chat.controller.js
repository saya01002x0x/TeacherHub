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

