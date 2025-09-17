import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  itinerary?: string[];
  emergencyContacts?: {name:string, phone:string, relationship:string}[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (user: User, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User|null>(null);
  const [token, setToken] = useState<string|null>(null);

  useEffect(() => {
    (async ()=>{
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      if(storedUser && storedToken){
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    })();
  }, []);

  const login = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", authToken);
  };

  const register = async (userData: User, authToken: string) => {
    await login(userData, authToken); // register behaves same as login
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  };

  return <AuthContext.Provider value={{user, token, login, logout, register}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
