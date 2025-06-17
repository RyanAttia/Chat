import React from "react";

const Notifications = ({ notifications, onClick }) => {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        maxWidth: 300,
        zIndex: 1000,
      }}
    >
      {notifications.map((msg) => (
        <div
          key={msg._id}
          onClick={() => onClick(msg.conversationId)}
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: 10,
            marginBottom: 8,
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          <strong>{msg.senderFullName || "Someone"}</strong>: {msg.text}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
