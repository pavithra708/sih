import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { SafetyProvider } from "../contexts/SafetyContext";
import { RecorderProvider } from "../contexts/RecorderContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RecorderProvider>
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
      </RecorderProvider>
    </AuthProvider>
  );
}
