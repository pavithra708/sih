import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TouristProfile {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  digitalId?: any;
  isTrackingEnabled?: boolean; // ✅ added so LocationContext can update this
}

interface AuthContextType {
  tourist: TouristProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    user: TouristProfile,
    token: string,
    encryptedPrivateKey?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateTourist: (updates: Partial<TouristProfile>) => Promise<void>; // ✅ added
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tourist, setTourist] = useState<TouristProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const tkn = await SecureStore.getItemAsync("token");
        if (userStr) setTourist(JSON.parse(userStr));
        if (tkn) setToken(tkn);
      } catch (e) {
        console.warn("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("http://<YOUR_SERVER_IP>:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const { user, token: tkn } = await res.json();
    setTourist(user);
    setToken(tkn);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await SecureStore.setItemAsync("token", tkn);
  };

  const register = async (user: TouristProfile, token: string, encryptedPrivateKey?: string) => {
    setTourist(user);
    setToken(token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await SecureStore.setItemAsync("token", token);
    if (encryptedPrivateKey) {
      await SecureStore.setItemAsync("encryptedPrivateKey", encryptedPrivateKey);
    }
  };

  const logout = async () => {
    setTourist(null);
    setToken(null);
    await AsyncStorage.removeItem("user");
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("encryptedPrivateKey");
  };

  const updateTourist = async (updates: Partial<TouristProfile>) => {
    if (!tourist) return;
    const updated = { ...tourist, ...updates };
    setTourist(updated);
    await AsyncStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        tourist,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!tourist,
        updateTourist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
