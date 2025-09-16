// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { SafetyProvider } from "../contexts/SafetyContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <SafetyProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="register" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafetyProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
