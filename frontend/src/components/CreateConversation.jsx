import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function CreateConversation({ onCreated, onCancel, existingConversations, selectConversation }) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (username.trim() === user.username) {
      setError("Cannot start a conversation with yourself.");
      return;
    }

    setLoading(true);
    try {
      const userRes = await api.get(`/users/username/${username.trim()}`);
      const otherUser = userRes.data;

      if (!otherUser) {
        setError("User not found.");
        setLoading(false);
        return;
      }

      const existingConv = existingConversations.find((conv) =>
        conv.participants.some((p) => p._id === otherUser._id)
      );

      if (existingConv) {
        selectConversation(existingConv);
        setUsername("");
        setLoading(false);
        onCancel();
        return;
      }

      const convRes = await api.post("/conversations", {
        participantIds: [user.id, otherUser._id],
        isGroup: false,
      });

      onCreated(convRes.data);
      selectConversation(convRes.data);
      setUsername("");
      onCancel();
    } catch (err) {
      console.error(err);
      setError("Failed to create conversation.");
    }
    setLoading(false);
  };

  return (
    // Wrap everything in a container that has the bottom border
    <form 
      onSubmit={handleSubmit} 
      style={{
        padding: "0.5rem 1rem 1rem 1rem", // bottom padding for Cancel button
        marginBottom: "1rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "180px" /* or whatever max width you want */, marginRight: "10px"  }}>
          <input
            placeholder="Enter Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            style={{
              width: "80%",
              padding: "0.75rem 1.5rem",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              fontSize: "1rem",
              outline: "none",
              marginBottom: "0.5rem",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            autoFocus
            disabled={loading}
          />
        </div>
      </div>

      {error && <div style={{ color: "red", marginTop: "0.25rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
        <button
        type="submit"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "9999px",         // Fully rounded bubble
          backgroundColor: loading ? "rgba(2, 136, 209, 0.3)" : "rgba(2, 136, 209, 0.1)",
          border: "1px solid rgba(2, 136, 209, 0.4)",
          color: loading ? "#999" : "#0288d1",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s ease",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onMouseOver={(e) => {
          if (!loading)
            e.currentTarget.style.backgroundColor = "rgba(2, 136, 209, 0.25)";
        }}
        onMouseOut={(e) => {
          if (!loading)
            e.currentTarget.style.backgroundColor = "rgba(2, 136, 209, 0.1)";
        }}
        disabled={loading}
      >
        {loading ? "Creating..." : "New Chat"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        style={{
          flex: 1,
          padding: "0.75rem 1.5rem",
          borderRadius: "9999px",   // Bubble shape
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "600",
          textDecoration: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "background 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }}
        disabled={loading}
      >
        Cancel
      </button>
      </div>


      {/* SIMPLE DIVIDER BELOW Cancel BUTTON */}
      <div
        style={{
          height: "2px",
          backgroundColor: "#ddd",
          marginTop: "18px",
          marginLeft: "-1rem",   // counteracts the 1rem horizontal padding
          marginRight: "-1rem",
          width: "calc(100% + 2rem)", // makes up for negative margins
          borderRadius: "1px",
        }}
      />
    </form>
  );
}
