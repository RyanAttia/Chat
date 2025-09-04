import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      loginUser(res.data.user);
      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <span style={{ color: "#0070f3" }}>HIVE</span> Sign Up
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
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            disabled={loading}
            onChange={handleChange}
            required
            style={{
              ...inputStyle,
              cursor: loading ? "not-allowed" : "text",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            disabled={loading}
            onChange={handleChange}
            required
            style={{
              ...inputStyle,
              cursor: loading ? "not-allowed" : "text",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            disabled={loading}
            onChange={handleChange}
            required
            style={{
              ...inputStyle,
              cursor: loading ? "not-allowed" : "text",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            disabled={loading}
            onChange={handleChange}
            required
            style={{
              ...inputStyle,
              cursor: loading ? "not-allowed" : "text",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          <select
            name="gender"
            value={form.gender}
            disabled={loading}
            onChange={handleChange}
            style={{
              ...inputStyle,
              appearance: "none",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: "#fff",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.3s ease, opacity 0.3s ease",
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#005bb5";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#0070f3";
            }}
          >
            {loading ? "Registering..." : "Register"}
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
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
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
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem 0",
  backgroundColor: "#0070f3",
  color: "white",
  borderRadius: "8px",
  fontWeight: "700",
  fontSize: "1.1rem",
  border: "none",
  cursor: "pointer",
  opacity: 1,
};
