// app/(tabs)/_layout.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Tabs } from "expo-router";
import { Home, User, Shield, Settings } from "lucide-react-native";

import { SafetyProvider } from "../../contexts/SafetyContext";
import { LocationProvider } from "../../contexts/LocationContext";
import { AuthProvider } from "../../contexts/AuthContext";

enableScreens();

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <SafetyProvider>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2196F3",
                tabBarInactiveTintColor: "#666",
                tabBarStyle: {
                  backgroundColor: "#fff",
                  borderTopWidth: 1,
                  borderTopColor: "#E0E0E0",
                  paddingBottom: 8,
                  paddingTop: 8,
                  height: 70,
                },
                tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{ title: "Home", tabBarIcon: ({ size, color }) => <Home size={size} color={color} /> }}
              />
              <Tabs.Screen
                name="profile"
                options={{ title: "Profile", tabBarIcon: ({ size, color }) => <User size={size} color={color} /> }}
              />
              <Tabs.Screen
                name="safety"
                options={{ title: "Safety", tabBarIcon: ({ size, color }) => <Shield size={size} color={color} /> }}
              />
              <Tabs.Screen
                name="settings"
                options={{ title: "Settings", tabBarIcon: ({ size, color }) => <Settings size={size} color={color} /> }}
              />
            </Tabs>
          </SafetyProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
