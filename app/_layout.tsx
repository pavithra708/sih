import React from "react";
import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";

function InnerLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  // 👇 handle routing logic here
  if (!isAuthenticated) {
    // default unauthenticated → Register first
    return <Redirect href="/register" />;
  }

  // authenticated → go to home (tabs)
  return <Redirect href="/(tabs)" />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* declare all screens so expo-router knows them */}
          <Stack.Screen name="register" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <InnerLayout />
        <StatusBar style="auto" />
      </LocationProvider>
    </AuthProvider>
  );
}
