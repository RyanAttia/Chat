import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false); // <-- New state

  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
      query: { userId: user.id },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      newSocket.emit("addUser", user._id);
      setSocketConnected(true); // <-- Mark connected
    });

    newSocket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setSocketConnected(false); // <-- Mark disconnected
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const emitEvent = (event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit:", event);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, emitEvent, socketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocketContext must be used within a SocketProvider");
  return context;
};
