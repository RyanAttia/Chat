import React from "react";
import { BiLogOut } from "react-icons/bi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      onClick={handleLogout}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        cursor: "pointer",
        borderRadius: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",  // glass background
        border: "1px solid rgba(255, 255, 255, 0.2)",  // similar to glass border
        fontWeight: "600",
        color: "#d32f2f",  // keep red color for logout text
        transition: "background 0.2s ease",
        marginTop: "auto",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(211, 47, 47, 0.1)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")
      }
    >
      <BiLogOut size={20} />
      Logout
    </div>
  );
}
