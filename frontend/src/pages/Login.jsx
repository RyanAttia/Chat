import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";


export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      loginUser(res.data.user);
      navigate("/");  // <-- Redirect on successful login

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "url('/bg.png') no-repeat center center fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "2rem 3rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontWeight: "700",
            fontSize: "2rem",
            color: "#222",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#0070f3" }}>HIVE</span> Login
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffdddd",
              color: "#900",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem 0",
              backgroundColor: "#0070f3",
              color: "white",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "1.1rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#005bb5";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#0070f3";
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#555",
          }}
        >
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              cursor: loading ? "not-allowed" : "pointer",
              textDecoration: "underline",
              fontWeight: "600",
              padding: 0,
              margin: 0,
              fontSize: "inherit",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
