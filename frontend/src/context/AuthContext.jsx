import { createContext, useContext, useEffect, useState } from "react";

// Create Context
export const AuthContext = createContext();  // <-- add export here

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const normalizedUser = {
        ...storedUser,
        id: storedUser.id || storedUser._id,
      };
      setUser(normalizedUser);
    }
  }, []);

  const loginUser = (userData) => {
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id, // <- normalize to `id`
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};


// 🔧 Export useAuth hook
export const useAuth = () => useContext(AuthContext);
