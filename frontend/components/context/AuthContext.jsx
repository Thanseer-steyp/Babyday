"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 run EVERY TIME token changes
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/user/me/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { username, email } = response.data;
        setUser({ username, email });
      } catch (error) {
        console.error(
          "Error fetching user info:",
          error.response || error.message
        );
        logout(); // clear if token is invalid
      } finally {
        setLoading(false);
      }
    };
    try {
      const decoded = jwtDecode(accessToken);
      const expiresAt = decoded.exp * 1000;
      const remainingTime = expiresAt - Date.now();

      if (remainingTime <= 0) {
        logout();
        return;
      }

      setUser({
        username: decoded.username || decoded.user_id,
      });

      // ⏰ AUTO logout when token expires
      const timer = setTimeout(logout, remainingTime);
      fetchUser(); 

      return () => clearTimeout(timer);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // 🔁 restore token on refresh
  useEffect(() => {
    const stored = localStorage.getItem("access");
    if (stored) setAccessToken(stored);
    else setLoading(false);
  }, []);

  const login = ({ access, refresh, username, email }) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setAccessToken(access); // 🔥 THIS triggers timer
    setUser({ username, email });
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
