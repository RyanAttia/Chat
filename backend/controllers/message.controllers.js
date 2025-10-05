import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import eventEmitter from "../eventEmitter.js";


export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.id; // or req.user if it's just the ID


    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      text,
    });

    const savedMessage = await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: savedMessage._id }, // push the new message id to messages array
      updatedAt: Date.now(),
    });
    // Add this timestamp
    const serverTimestamp = Date.now();

    // Emit event with timestamp (for latency testing)
    eventEmitter.emit("conversationUpdated", {
      conversationId,
      message: savedMessage,
      serverTimestamp,
    });

    res.status(201).json({ ...savedMessage.toObject(), serverTimestamp });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username fullName gender")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};
