import { createContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import { fetchCurrentUser } from "../api/authApi";
import type { User } from "../types";

export interface AuthContextValue {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  logout: () => void;
  saveLogin: (accessToken: string) => void;
  token: string | null;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(token));

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      if (!token) {
        setUser(null);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (!ignore) setUser(currentUser);
      } catch {
        localStorage.removeItem("access_token");
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setIsCheckingAuth(false);
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, [token]);

  function saveLogin(accessToken: string) {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isCheckingAuth,
      logout,
      saveLogin,
      token,
      user,
      setUser,
    }),
    [isCheckingAuth, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
