import { generateStreamToken, getStreamServerClient } from "../config/stream.js";

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

export const sendSystemMessage = async (req, res) => {
  try {
    const { channelId, channelType = "messaging", message } = req.body;

    if (!channelId || !message) {
      return res.status(400).json({ message: "channelId and message are required" });
    }

    const streamClient = getStreamServerClient();
    const channel = streamClient.channel(channelType, channelId);

    // Get authenticated user ID from Clerk
    const userId = req.auth().userId;

    // Send system message using server SDK with user_id
    const response = await channel.sendMessage({
      text: message,
      type: "system",
      user_id: userId,
    });

    res.status(200).json({
      success: true,
      messageId: response.message.id,
    });
  } catch (error) {
    console.error("Error sending system message:", error);
    res.status(500).json({
      message: "Failed to send system message",
      error: error.message,
    });
  }
};
