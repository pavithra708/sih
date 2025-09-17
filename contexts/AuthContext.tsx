// /contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface TouristProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  digitalId?: any;
  isTrackingEnabled?: boolean;
  tripEndDate?: string;
  itinerary?: string[];
  emergencyContacts?: EmergencyContact[];
}

interface AuthContextType {
  tourist: TouristProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (user: TouristProfile, token: string, encryptedPrivateKey?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateTourist: (updates: Partial<TouristProfile>) => Promise<void>;
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
        if (userStr) {
          const parsed = JSON.parse(userStr);
          setTourist({
            ...parsed,
            id: String(parsed.id),
            itinerary: parsed.itinerary || [],
            emergencyContacts: parsed.emergencyContacts || [],
          });
        }
        if (tkn) setToken(tkn);
      } catch (e) {
        console.warn("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const SERVER_IP = "192.168.0.201";
  const SERVER_PORT = "5000";

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Login failed. Check server connection.");
      }

      const { user, token: tkn } = await res.json();

      const normalizedUser: TouristProfile = {
        ...user,
        id: String(user.id),
        itinerary: user.itinerary || [],
        emergencyContacts: user.emergencyContacts || [],
      };

      setTourist(normalizedUser);
      setToken(tkn);
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
      await SecureStore.setItemAsync("token", tkn);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Network request failed");
    }
  };

  const register = async (user: TouristProfile, token: string, encryptedPrivateKey?: string) => {
    const normalizedUser: TouristProfile = {
      ...user,
      id: String(user.id),
      itinerary: user.itinerary || [],
      emergencyContacts: user.emergencyContacts || [],
    };

    setTourist(normalizedUser);
    setToken(token);
    await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
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
    const updated: TouristProfile = {
      ...tourist,
      ...updates,
      itinerary: updates.itinerary ?? tourist.itinerary ?? [],
      emergencyContacts: updates.emergencyContacts ?? tourist.emergencyContacts ?? [],
      id: String(updates.id ?? tourist.id),
    };
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
