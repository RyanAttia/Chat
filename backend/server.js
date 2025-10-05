import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import User from "./models/user.model.js";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";

import eventEmitter from "./eventEmitter.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);



app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === Socket Maps ===
const userSocketMap = new Map(); // userId -> Set of socketIds
const userStatusMap = {};        // userId -> status

const joinUser = (userId, socketId) => {
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socketId);
};

const leaveUser = (userId, socketId) => {
  if (userSocketMap.has(userId)) {
    userSocketMap.get(userId).delete(socketId);
    if (userSocketMap.get(userId).size === 0) {
      userSocketMap.delete(userId);
    }
  }
};

const emitToUser = (userId, event, data) => {
  const sockets = userSocketMap.get(userId);
  if (sockets) {
    sockets.forEach((sid) => {
      io.to(sid).emit(event, data);
    });
  }
};

const emitToConversation = (conversationId, event, data) => {
  io.to(conversationId.toString()).emit(event, data);
};

const emitConversationUpdate = async (conversationId) => {
  try {
    // Fetch the updated conversation with populated participants
    const updatedConversation = await Conversation.findById(conversationId)
      .populate('participants', 'username fullName')
      .populate('messages');
    
    if (!updatedConversation) {
      console.warn(`Conversation ${conversationId} not found for update`);
      return;
    }

    // Emit to all participants
    updatedConversation.participants.forEach(participant => {
      emitToUser(participant._id.toString(), "updateConversation", updatedConversation);
    });
    
  } catch (error) {
    console.error('Error emitting conversation update:', error);
  }
};

// === Socket.io ===
io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId || userId === "undefined") return;

  joinUser(userId, socket.id);

  // Load status or use default
  const user = await User.findById(userId).select("status");
  userStatusMap[userId] = user?.status ?? 1;

  // Emit initial status and online users
  socket.emit("initialUserStatuses", userStatusMap);
  socket.broadcast.emit("updateUserStatus", { userId, status: userStatusMap[userId] });
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Join room for a conversation
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId.toString());
  });

  // Manual status change (e.g., Busy, Invisible)
  socket.on("updateUserStatus", async ({ userId, status }) => {
    try {
      if (!userId || typeof status !== "number") return;

      userStatusMap[userId] = status;

      const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true });

      if (updatedUser) {
        io.emit("updateUserStatus", { userId, status });
      } else {
        console.warn(`User not found for status update: ${userId}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  });

  // Message sending
  socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    for (const [uid, sockets] of userSocketMap.entries()) {
      if (uid !== senderId) {
        sockets.forEach((sid) => {
          io.to(sid).emit("receiveMessage", { conversationId, senderId, text });
        });
      }
    }
    emitToConversation(conversationId, "receiveMessage", { conversationId, senderId, text });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    leaveUser(userId, socket.id);

    setTimeout(async () => {
      if (!userSocketMap.has(userId)) {
        userStatusMap[userId] = 4; // offline
        await User.findByIdAndUpdate(userId, { status: 4 });
        io.emit("updateUserStatus", { userId, status: 4 });
      }
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }, 3000); // wait 3 seconds before marking offline
  });
});

// === 🔁 LISTEN FOR BACKEND EVENTS AND EMIT OVER SOCKET.IO ===
eventEmitter.on("conversationCreated", (conversation) => {
  const participants = conversation.participants || [];
  participants.forEach((user) => {
    emitToUser(user._id.toString(), "newConversation", conversation);
  });
});

eventEmitter.on("conversationUpdated", ({ conversationId, message }) => {
  const serverTimestamp = Date.now(); // precise server emission time
  io.to(conversationId).emit("newMessage", { message, serverTimestamp });
});

// === Connect to DB & Start Server ===
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_DO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
