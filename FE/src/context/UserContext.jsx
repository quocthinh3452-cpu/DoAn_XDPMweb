import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi, logout as logoutApi } from "../services/authService";

const UserContext = createContext(null);

const USER_KEY   = "techstore_user";
const TOKEN_KEY  = "techstore_token";

export function UserProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from storage

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  // ── Actions ───────────────────────────────────────────────

  async function login(credentials) {
    const res = await loginApi(credentials);
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
    return u;
  }

  async function register(payload) {
    const res = await registerApi(payload);
    const { user: u, token: t } = res.data;
    setUser(u);
    setToken(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
    return u;
  }

  async function logout() {
    await logoutApi();
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  // Update stored user profile (e.g. after saving shipping info)
  function updateUser(partial) {
    const updated = { ...user, ...partial };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }

  const isLoggedIn = !!user;

  return (
    <UserContext.Provider value={{ user, token, isLoggedIn, loading, login, register, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
