import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../../services/api";
import type { UserResponseDTO, AuthResponseDTO } from "../../types/api.types";

interface AuthContextType {
  user: UserResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<void> => {
    const response = await api.post<AuthResponseDTO>("/auth/login", {
      identifier,
      password
    });

    const { user: loggedInUser, token: authToken } = response.data;
    setUser(loggedInUser);
    setToken(authToken);

    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    const response = await api.post<AuthResponseDTO>("/auth/register", {
      username,
      email,
      password
    });

    const { user: registeredUser, token: authToken } = response.data;
    setUser(registeredUser);
    setToken(authToken);

    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_user", JSON.stringify(registeredUser));
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
