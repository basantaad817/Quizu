"use client";
import ApiRequest from "@/utils/apiRequest";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log(storedToken);
    if (storedToken && storedToken.length > 0) {
      setToken(JSON.parse(storedToken));
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", JSON.stringify(token));
    } else {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser({});
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await ApiRequest.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.data?.data?.user) {
          setUser(res.data.data.user);
          setIsAuthenticated(true);
        } else {
          throw new Error("User data not found");
        }
      } catch (error) {
        setUser({});
        setIsAuthenticated(false);
      } finally {
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        token,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
