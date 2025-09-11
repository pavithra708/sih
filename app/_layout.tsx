// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import "../i18n";

function InnerLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can replace with a SplashScreen or loading indicator
    return null;
  }

  // Unauthenticated layout (register/login)
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="register" />
        <Stack.Screen name="login" />
        <Stack.Screen name="+not-found" />
      </Stack>
    );
  }

  // Authenticated layout (tabs only)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <InnerLayout />
        <StatusBar style="auto" />
      </LocationProvider>
    </AuthProvider>
  );
}
