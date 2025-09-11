// screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const onLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate("Safety"); // or main
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Invalid credentials");
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, padding:8}} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, padding:8, marginTop:8}} />
      <Button title="Login" onPress={onLogin} />
    </View>
  );
}
