// app/register.tsx
import React, { useState } from "react";
import {
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { hashDataSHA256 } from "../utils/hashUtils"; // frontend-safe SHA256

const API_BASE = "http://192.168.19.170:5000";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  aadhaarPassport: string;
  tripStartDate: string;
  tripEndDate: string;
  itinerary: string;
  emergencyContacts: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    aadhaarPassport: "",
    tripStartDate: "",
    tripEndDate: "",
    itinerary: "",
    emergencyContacts: "",
  });
  const [kycImage, setKycImage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const askPermissions = async (): Promise<boolean> => {
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== "granted") { Alert.alert("Camera required"); return false; }

    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== "granted") { Alert.alert("Location required"); return false; }

    const micPerm = await Audio.requestPermissionsAsync();
    if (micPerm.status !== "granted") { Alert.alert("Microphone required"); return false; }

    return true;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setKycImage(result.assets[0]);
  };

  const verifyKYCOnServer = async () => {
    if (!kycImage) return { ok: false, error: "Upload ID photo first." };
    const fd = new FormData();
    fd.append("kycImage", {
      uri: kycImage.uri,
      name: "kyc.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const res = await fetch(`${API_BASE}/api/auth/kyc-verify`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || "KYC failed" };
      return { ok: true, data: json };
    } catch (err: any) {
      return { ok: false, error: err.message || "Network request failed" };
    }
  };

  const validateEmergencyContacts = (contacts: string) => {
    const numbers = contacts
      .split(",")
      .map(c => c.trim())
      .filter(c => /^\d{10}$/.test(c));
    return numbers.length > 0;
  };

  const checkOffItinerary = () => {
    const today = new Date();
    const start = new Date(formData.tripStartDate);
    return start < today;
  };

  const onSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return Alert.alert("Validation", "Name, email, and password required");
    }
    if (!validateEmergencyContacts(formData.emergencyContacts)) {
      return Alert.alert("Validation", "Enter at least one valid 10-digit emergency contact");
    }

    const perms = await askPermissions();
    if (!perms) return;

    setIsLoading(true);

    const kycResult = await verifyKYCOnServer();
    if (!kycResult.ok) {
      setIsLoading(false);
      Alert.alert("KYC failed", kycResult.error);
      return;
    }

    if (kycResult.data.name && kycResult.data.name !== formData.name) {
      Alert.alert("Warning", "Name does not match ID document");
    }

    if (checkOffItinerary()) {
      Alert.alert("Warning", "Trip start date is in the past (Off-Itinerary)");
    }

    // Frontend-safe SHA256 hash
    const digitalIdHash = hashDataSHA256({ ...formData });

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ""));
    fd.append("digitalIdHash", digitalIdHash);

    if (kycResult.data?.aadhaar) fd.append("detectedAadhaar", kycResult.data.aadhaar);
    if (kycResult.data?.passport) fd.append("detectedPassport", kycResult.data.passport);

    if (kycImage) {
      const fileName = kycImage.uri.split("/").pop() || "kyc.jpg";
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : "image";
      fd.append("kycImage", { uri: kycImage.uri, name: fileName, type } as any);
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register-multipart`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      Alert.alert("Registered", "Account created successfully.", [
        { text: "Go to Login", onPress: () => router.push("/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Register error", err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Register / KYC Verification</Text>

        {Object.keys(formData).map(key => (
          <TextInput
            key={key}
            placeholder={key}
            secureTextEntry={key === "password"}
            value={(formData as any)[key]}
            onChangeText={v => setFormData(prev => ({ ...prev, [key]: v }))}
            style={styles.input}
            autoCapitalize={key === "email" ? "none" : "sentences"}
          />
        ))}

        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Take/Upload ID Photo</Text>
        </TouchableOpacity>
        {kycImage && <Text style={{ marginTop: 8 }}>Image selected: {kycImage.uri}</Text>}

        <TouchableOpacity style={styles.registerBtn} onPress={onSubmit} disabled={isLoading}>
          <Text style={styles.registerText}>{isLoading ? "Processing..." : "Verify & Register"}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={{ textAlign: "center", color: "#2196F3" }}>
            Already registered? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginTop: 8, padding: 10 },
  uploadBtn: {
    marginTop: 16,
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  registerBtn: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
