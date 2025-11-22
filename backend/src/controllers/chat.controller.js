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

