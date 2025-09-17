// app/(tabs)/_layout.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Tabs } from "expo-router";
import { Home, User, Shield, Settings } from "lucide-react-native";

// ✅ import your providers
import { RecorderProvider } from "../../contexts/RecorderContext";
import { SafetyProvider } from "../../contexts/SafetyContext";
import { LocationProvider } from "../../contexts/LocationContext";
import { AuthProvider } from "../../contexts/AuthContext";

// ✅ import i18n provider
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n/i18n"; // adjust the path if needed

enableScreens();

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <RecorderProvider>
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
                    options={{
                      title: "Home",
                      tabBarIcon: ({ size, color }) => (
                        <Home size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="profile"
                    options={{
                      title: "Profile",
                      tabBarIcon: ({ size, color }) => (
                        <User size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="safety"
                    options={{
                      title: "Safety",
                      tabBarIcon: ({ size, color }) => (
                        <Shield size={size} color={color} />
                      ),
                    }}
                  />
                  <Tabs.Screen
                    name="settings"
                    options={{
                      title: "Settings",
                      tabBarIcon: ({ size, color }) => (
                        <Settings size={size} color={color} />
                      ),
                    }}
                  />
                </Tabs>
              </SafetyProvider>
            </LocationProvider>
          </RecorderProvider>
        </AuthProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
