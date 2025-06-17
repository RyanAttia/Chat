import React, { useEffect, useState } from "react";
import Avatar from "../utils/avatar";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext"; 
import LogoutButton from "./LogoutButton";
import UserStatusDropdown from "./UserStatusDropdown";
import api from "../utils/api";
import CreateConversation from "./CreateConversation";  // <--- Import it
import { BiPlus } from "react-icons/bi";



const statusColors = {
  1: "#4caf50",  // Online - green
  2: "#9e9e9e",  // Hidden - gray
  3: "#ff9800",  // Busy - orange
  4: "#f44336",  // Offline - red
};


export default function Sidebar({ activeConversationId, selectConversation }) {
  const { user } = useAuth();
  const { socket } = useSocketContext();   // <-- get socket from context


  const [conversations, setConversations] = useState([]);
  const [userStatuses, setUserStatuses] = useState({}); // { userId: statusValue }

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);


  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/conversations");
        const sorted = res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setConversations(sorted);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("initialUserStatuses", (statuses) => {
      console.log("Initial statuses:", statuses);
      setUserStatuses(statuses);
    });

    socket.on("updateUserStatus", ({ userId, status }) => {
      console.log("Status update received:", userId, status);
      setUserStatuses((prev) => ({ ...prev, [userId]: status }));
    });

    socket.on("newConversation", (conversation) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    });

    // 🔥 Real-time reordering of conversation on update
    socket.on("updateConversation", (updatedConversation) => {

      // This function should update your state that holds the list of conversations
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        );

        // Optional: Move updated conversation to top
        const target = updated.find(conv => conv._id === updatedConversation._id);
        const others = updated.filter(conv => conv._id !== updatedConversation._id);
        return [target, ...others];
      });
    });


    return () => {
      socket.off("initialUserStatuses");
      socket.off("updateUserStatus");
      socket.off("newConversation");
      socket.off("updateConversation"); // cleanup

    };
  }, [socket]);



  const handleConversationCreated = (newConv) => {
    selectConversation(newConv);
    setShowCreate(false);
  };


  return (
    <div
      className="sidebar glass"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "280px",
        backgroundColor: "rgba(0, 0, 0, 0.4)", // override if needed
        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1rem", textAlign: "center"}}>
        <h3 style={{ margin: 0, }}>Chats</h3>
        
        {!showCreate && (
        <>
          <div
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              paddingLeft: "4rem", // 👈 shift text/icon to the right
              cursor: "pointer",
              borderRadius: "8px",
              backgroundColor: "rgba(173, 216, 230, 0.08)",
              border: "1px solid rgba(2, 136, 209, 0.4)",
              fontWeight: "600",
              color: "#0288d1",
              transition: "background 0.2s ease",
              marginTop: "0.75rem",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 90, 138, 0.15)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(173, 216, 230, 0.08)")
            }
          >
            <BiPlus size={20} />
            Create Chat
          </div>

          {/* SIMPLE DIVIDER BELOW +Create BUTTON */}
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
        </>
      )}
      </div>

      {showCreate && (
        <CreateConversation
          onCreated={handleConversationCreated}
          onCancel={() => setShowCreate(false)}
          existingConversations={conversations}
          selectConversation={selectConversation}
        />
      )}

      {/* Scrollable conversation list */}
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "0.5rem 1rem",
        }}
      >
        {loading && <div>Loading conversations...</div>}
        {!loading && conversations.length === 0 && <div>No conversations found.</div>}

        {conversations.map((conv) => {
          // Get other participants (exclude current user)
          const otherParticipants = conv.participants.filter((p) => p._id !== user.id);
          // For now, assume 1-on-1 chat, so show first other participant
          const participant = otherParticipants[0];

          const status = userStatuses[participant?._id] ?? 4; // default to Offline (4) if unknown
          console.log("UserStatuses Map:", userStatuses);
          console.log(`Status for ${participant?._id}:`, userStatuses[participant?._id]);
          const statusColor = statusColors[status] || "#9e9e9e";

           console.log("Participant:", participant);
            console.log("Participant fullName:", participant?.fullName);
            console.log("Participant username:", participant?.username);

          return (
            <div
              key={conv._id}
              onClick={() => selectConversation(conv)}
              className={`conversation-item ${activeConversationId === conv._id ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                backgroundColor: activeConversationId === conv._id ? "rgba(255,255,255,0.1)" : "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s ease",
                border: activeConversationId === conv._id ? "2px solid white" : "2px solid transparent",
              }}
              onMouseOver={(e) => {
                if (activeConversationId !== conv._id) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
              onMouseOut={(e) => {
                if (activeConversationId !== conv._id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >

              <div style={{ position: "relative", width: 40, height: 40 }}>
                <Avatar username={participant?.username || "unknown"} size={40} />
                {/* Status circle */}
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: statusColor,
                    border: "2px solid white",
                  }}
                />
              </div>

              <div style={{ marginLeft: 10 }}>
                <div style={{ fontWeight: "600", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {participant?.fullName || "Unknown"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom status + logout */}
      <div
            style={{
              height: "2px",
              backgroundColor: "#ddd",
              marginTop: "4px",
              marginBottom: "18px",  // <-- add bottom margin here
              width: "100%",
              borderRadius: "1px",
            }}
      />
        <UserStatusDropdown />
        <LogoutButton />
      
    </div>
  );
}
