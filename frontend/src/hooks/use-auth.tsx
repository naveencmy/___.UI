import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "cashier" | "worker" | "manager" | "owner";

export interface CurrentUser {
  name: string;
  role: Role;
}

interface AuthContextValue {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "retailpos.currentUser";

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): CurrentUser | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as CurrentUser;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readStoredUser());

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      login: (user: CurrentUser) => setCurrentUser(user),
      logout: () => {
        localStorage.removeItem("token");
        setCurrentUser(null);
      },
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
