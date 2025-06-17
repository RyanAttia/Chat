import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocketContext } from "../context/SocketContext.jsx";
import api from "../utils/api.js";

const statusOptions = [
  { value: 1, label: "Online", color: "#4caf50" },
  { value: 2, label: "Hidden", color: "#9e9e9e" },
  { value: 3, label: "Busy", color: "#ff9800" },
  { value: 4, label: "Offline", color: "#f44336" },
];

const UserStatusDropdown = () => {
  const { user } = useAuth();
  const { socket, socketConnected, emitEvent } = useSocketContext();

  const [selectedStatus, setSelectedStatus] = useState(user?.status ?? 1);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleChange = (status) => {
    setSelectedStatus(status.value);
    setIsOpen(false);
    localStorage.setItem("userStatus", status.value);
    if (user?.id) {
      emitEvent("updateUserStatus", {
        userId: user.id,
        status: status.value,
      });
    }
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await api.get(`/users/${user.id}`);
        const data = res.data;
        if (data?.status !== undefined) {
          setSelectedStatus(data.status);
          if (socketConnected) {
            emitEvent("updateUserStatus", {
              userId: user.id,
              status: data.status,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user status", err);
      }
    };

    if (user?.id && socketConnected) {
      fetchUserStatus();
    }
  }, [user, socketConnected, emitEvent]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ userId, status }) => {
      if (userId === user.id) {
        setSelectedStatus(status);
      }
    };

    socket.on("updateUserStatus", handleStatusUpdate);
    return () => {
      socket.off("updateUserStatus", handleStatusUpdate);
    };
  }, [socket, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = statusOptions.find((opt) => opt.value === selectedStatus);

  return (
    <div
      className="glass"
      ref={dropdownRef}
      style={{
        position: "relative",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: "1rem",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.16)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")
      }
    >
      <div onClick={() => setIsOpen((prev) => !prev)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: selected.color,
          }}
        />
        <span>{selected.label}</span>
      </div>

      {isOpen && (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, -1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            marginTop: "0.5rem",
            zIndex: 10,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            color: "#ffffff",
          }}
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleChange(option)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                backgroundColor:
                  selectedStatus === option.value ? "rgba(255, 255, 255, 0.04)" : "transparent",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedStatus === option.value ? "rgba(255, 255, 255, 0.04)" : "transparent")
              }
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: option.color,
                }}
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserStatusDropdown;
