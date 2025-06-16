import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  messages: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Message" 
  }],
  isGroup: { 
    type: Boolean, 
    default: false 
  },
  groupName: { 
    type: String, 
    default: null 
  },
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
