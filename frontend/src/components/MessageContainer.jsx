import React, { useEffect, useRef } from "react";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import { useAuth } from "../context/AuthContext";
import {
  formatDateHeader,
  formatTime,
  groupMessagesByDate,
} from "../utils/formatDateHeader.js";
import MessageBubble from "../components/MessageBubble.jsx"; // <-- Import the new component

export default function MessageContainer({ messages, loading }) {
  const { user } = useAuth();
  const containerRef = useRef();

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      className="message-container p-4 space-y-4 overflow-y-auto"
      style={{
        flexGrow: 1,
        padding: "1rem",
        borderRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#f0f0f0",
        overflowY: "auto",
      }}
    >
      {loading ? (
        <>
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </>
      ) : (
        groupedMessages.map((item) => {
          if (item.type === "divider") {
            return (
              <div
                key={item.key}
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: "0.8rem",
                  margin: "1rem 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "1rem 0",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "#ddd",
                      fontSize: "0.75rem",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      maxWidth: "80%",
                    }}
                  >
                    {formatDateHeader(item.date)}
                  </div>
                </div>
              </div>
            );
          }

          const msg = item;
          const isSender =
            msg.sender?._id === user.id ||
            msg.sender === user.id ||
            msg.senderId === user.id;

          return (
            <div
              key={msg.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSender ? "flex-end" : "flex-start",
                marginBottom: "0.25rem",
              }}
            >
              <div
                className={`bubble ${isSender ? "sender" : "receiver"}`}
              >
                {msg.text}
              </div>

              {msg.showTime && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#ccc",
                    marginTop: "4px",
                    marginLeft: isSender ? "auto" : "0.5rem",
                    marginRight: isSender ? "0.5rem" : "auto",
                  }}
                >
                  {formatTime(msg.createdAt)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
