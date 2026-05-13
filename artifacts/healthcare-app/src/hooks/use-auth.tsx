import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import type { User, LoginInput, RegisterInput } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("healthcare_token"));

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("healthcare_user");
    const storedToken = localStorage.getItem("healthcare_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("healthcare_user");
        localStorage.removeItem("healthcare_token");
      }
    }
    setIsLoading(false);
  }, []);

  const redirectByRole = (role: string) => {
    if (role === "patient") setLocation("/patient");
    else if (role === "doctor") setLocation("/doctor");
    else if (role === "caretaker") setLocation("/patient");
    else if (role === "hospital_admin") setLocation("/hospital-admin");
    else setLocation("/");
  };

  const login = async (data: LoginInput) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Invalid credentials");
    }

    const { token, user: newUser } = await response.json();
    localStorage.setItem("healthcare_token", token);
    localStorage.setItem("healthcare_user", JSON.stringify(newUser));
    setUser(newUser);
    redirectByRole(newUser.role);
  };

  const register = async (data: RegisterInput) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Registration failed");
    }

    const { token, user: newUser } = await response.json();
    localStorage.setItem("healthcare_token", token);
    localStorage.setItem("healthcare_user", JSON.stringify(newUser));
    setUser(newUser);
    redirectByRole(newUser.role);
  };

  const logout = () => {
    localStorage.removeItem("healthcare_user");
    localStorage.removeItem("healthcare_token");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
