import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import MessageContainer from "../components/MessageContainer";
import { useAuth } from "../context/AuthContext";
import { TiMessages } from "react-icons/ti";


const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || "http://localhost:5000";

export default function Home() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_SERVER_URL, { query: { userId: user.id } });

    socketRef.current.on("receiveMessage", (msg) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }

      const audio = new Audio("/notification.mp3");
      audio.play().catch((err) => {
        console.warn("🔇 Failed to play notification sound:", err);
      });


      // Update conversation's updatedAt and reorder list
      setConversations((prev) => {
        let updated = false;
        const newList = prev.map((conv) => {
          if (conv._id === msg.conversationId) {
            updated = true;
            // Update updatedAt to now or msg timestamp
            return { ...conv, updatedAt: new Date().toISOString() };
          }
          return conv;
        });

        if (!updated) return prev;

        // Sort by updatedAt descending
        return newList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socketRef.current.on("updateConversation", (updatedConv) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === updatedConv._id);
        let newList;

        if (exists) {
          newList = prev.map((conv) =>
            conv._id === updatedConv._id ? updatedConv : conv
          );
        } else {
          newList = [updatedConv, ...prev];
        }

        return newList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      // Optionally update activeConv if it is the updated conversation (to get fresh data)
      if (activeConv?._id === updatedConv._id) {
        setActiveConv(updatedConv);
      }
    });

    // user status updates
    socketRef.current.on("updateUserStatus", ({ userId, status }) => {
      setConversations((prev) =>
        prev.map((conv) => {
          const participant = conv.participants.find((p) => p._id === userId);
          if (participant) {
            participant.userStatus = status;
          }
          return conv;
        })
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, activeConv]);


  useEffect(() => {
    if (!user) return;

      api
        .get("/api/conversations")
        .then((res) => setConversations(res.data))
        .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!activeConv) return;

    api
      .get(`/api/messages/${activeConv._id}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [activeConv]);

  const selectConversation = (conv) => {
    setActiveConv(conv);
    if (socketRef.current && conv?._id) {
      socketRef.current.emit("joinConversation", conv._id);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConv) return;

    const msgData = {
      conversationId: activeConv._id,
      text: newMessage,
    };

    api
      .post("/api/messages", msgData)
      .then((res) => {
        setMessages((prev) => [...prev, res.data]);
        socketRef.current.emit("sendMessage", {
          conversationId: activeConv._id,
          senderId: user.id,
          text: newMessage,
        });
        setNewMessage("");
      })
    .catch(console.error);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "url('/bg.png') no-repeat center center fixed",
        backgroundSize: "cover",
        display: "flex",
        padding: "1rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#eee",
      }}
    >


      {/* Main content */}
      <div className="glass" style={{ position: "relative", display: "flex", width: "90%", maxWidth: "900px", margin: "3rem auto", overflow: "hidden", transform: "scale(0.85)", zIndex: 1 }}>
        <Sidebar
          conversations={conversations}
          selectConversation={selectConversation}
          activeConversationId={activeConv?._id}
          style={{ flexBasis: "280px", borderRight: "1px solid #ddd" }}
        />

        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            padding: "1rem 1.5rem",
          }}
        >
          {activeConv ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <h3 style={{ margin: 0, fontWeight: "700" }}>
                  {activeConv.isGroup
                    ? activeConv.groupName
                    : activeConv.participants.find((p) => p._id !== user.id)?.fullName}
                </h3>

              </div>
              <MessageContainer messages={messages} />
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  gap: "0.5rem",
                  borderTop: "1px solid #eee",
                  paddingTop: "0.75rem",
                }}
              >
                <input
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  style={inputStyle}
                />
                <button
                  onClick={handleSendMessage}
                  style={sendButtonStyle}
                  disabled={!newMessage.trim()}
                  onMouseOver={(e) => {
                    if (newMessage.trim()) e.currentTarget.style.backgroundColor = "#005bb5";
                  }}
                  onMouseOut={(e) => {
                    if (newMessage.trim()) e.currentTarget.style.backgroundColor = "#0070f3";
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <p style={{ fontSize: "3rem", fontWeight: "300", color: "#e0e0e0", margin: 0 }}>
              Welcome 👋 {user.fullName} 🐝
            </p>
            <p style={{ fontSize: "2rem", fontWeight: "300", color: "#cccccc", margin: 0 }}>
              Select a chat or start a new one.
            </p>
            <TiMessages style={{ fontSize: "6rem", color: "#aaaaaa" }} />
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  flexGrow: 1,
  padding: "0.75rem 1rem",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  color: "#f0f0f0",
  outline: "none",
};

const sendButtonStyle = {
  padding: "0 1.5rem",
  backgroundColor: "#0070f3",
  color: "white",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
  opacity: 1,
  disabledOpacity: 0.5,
};
