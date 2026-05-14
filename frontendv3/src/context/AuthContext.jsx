import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      console.log("[AuthContext] Checking session via GET /auth/me");
      const res = await api.get("/auth/me");
      const me = res?.data?.user ?? null;
      console.log("[AuthContext] Session user:", me?.id);
      console.log(me);
      setUser(me);
    } catch (err) {
      console.log("[AuthContext] No active session:", err?.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const login = async ({ email, password }) => {
    console.log("[AuthContext] Logging in:", email);
    const res = await api.post("/auth/login", { email, password });
    console.log(res);
    const nextUser = res?.data?.user ?? null;
    setUser(nextUser);
    return nextUser;
  };

  const register = async ({ name, email, hometown, password }) => {
    console.log("[AuthContext] Registering:", email);
    const res = await api.post("/auth/register", {
      name,
      email,
      hometown,
      password,
    });
    const nextUser = res?.data?.user ?? null;
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    console.log("[AuthContext] Logging out");
    await api.post("/auth/logout");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refetchMe: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

