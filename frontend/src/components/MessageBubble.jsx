// MessageBubble.jsx
import React from "react";
import "../MessageBubble.css";

export default function MessageBubble({ text, isSender }) {
  return (
    <div className={`chat-bubble ${isSender ? "sender" : "receiver"}`}>
      {text}
    </div>
  );
}
