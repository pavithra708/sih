// screens/RegisterScreen.tsx
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
import { router } from "expo-router";
import { hashDataSHA256 } from "../utils/hashUtils";

const API_BASE = "http://192.168.19.170:5000";

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  aadhaarPassport: string;
  tripStartDate: string;
  tripEndDate: string;
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
    emergencyContacts: "",
  });

  const [itinerary, setItinerary] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [kycImage, setKycImage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Request all required permissions
  const askPermissions = async (): Promise<boolean> => {
    try {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== "granted") {
        Alert.alert("Permission Required", "Camera access is required.");
        return false;
      }

      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== "granted") {
        Alert.alert("Permission Required", "Location access is required.");
        return false;
      }

      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus !== "granted") {
        Alert.alert("Permission Required", "Media Library access is required.");
        return false;
      }

      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to request permissions.");
      return false;
    }
  };

  // Pick image for KYC
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled) {
        setKycImage(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  // Validate emergency contacts
  const validateEmergencyContacts = (contacts: string) =>
    contacts.split(",").map(c => c.trim()).filter(c => /^\d{10}$/.test(c)).length > 0;

  // Check if trip start date is in the past
  const checkOffItinerary = () => {
    if (!formData.tripStartDate) return false;
    return new Date(formData.tripStartDate) < new Date();
  };

  const addStop = () => {
    if (newStop.trim()) {
      setItinerary([...itinerary, newStop.trim()]);
      setNewStop("");
    }
  };

  // Verify KYC on server
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

  // Submit registration
  const onSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return Alert.alert("Validation", "Name, email, and password are required.");
    }

    if (!validateEmergencyContacts(formData.emergencyContacts)) {
      return Alert.alert("Validation", "Enter at least one valid 10-digit emergency contact.");
    }

    const perms = await askPermissions();
    if (!perms) return;

    setIsLoading(true);
    const kycResult = await verifyKYCOnServer();
    if (!kycResult.ok) {
      setIsLoading(false);
      return Alert.alert("KYC failed", kycResult.error);
    }

    if (kycResult.data.name && kycResult.data.name !== formData.name) {
      Alert.alert("Warning", "Name does not match ID document.");
    }

    if (checkOffItinerary()) {
      Alert.alert("Warning", "Trip start date is in the past (Off-Itinerary).");
    }

    const digitalIdHash = hashDataSHA256(JSON.stringify(formData));
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ""));
    fd.append("digitalIdHash", digitalIdHash);
    fd.append("itinerary", JSON.stringify(itinerary));

    if (kycResult.data?.aadhaar) fd.append("detectedAadhaar", kycResult.data.aadhaar);
    if (kycResult.data?.passport) fd.append("detectedPassport", kycResult.data.passport);

    if (kycImage) {
      const fileName = kycImage.uri.split("/").pop() || "kyc.jpg";
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      fd.append("kycImage", { uri: kycImage.uri, name: fileName, type } as any);
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register-multipart`, { method: "POST", body: fd });
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
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

        <Text style={styles.label}>Trip Itinerary</Text>
        <TextInput
          placeholder="Enter stop/location"
          value={newStop}
          onChangeText={setNewStop}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addStop}>
          <Text style={{ color: "#fff" }}>Add Stop</Text>
        </TouchableOpacity>
        {itinerary.map((stop, i) => <Text key={i}>• {stop}</Text>)}

        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Take/Upload ID Photo</Text>
        </TouchableOpacity>
        {kycImage && <Text>Image selected: {kycImage.uri}</Text>}

        <TouchableOpacity style={styles.registerBtn} onPress={onSubmit} disabled={isLoading}>
          <Text style={styles.registerText}>{isLoading ? "Processing..." : "Verify & Register"}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={{ textAlign: "center", color: "#2196F3" }}>Already registered? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginTop: 8, padding: 10 },
  label: { marginTop: 16, fontWeight: "bold" },
  addBtn: { marginTop: 8, backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, alignItems: "center" },
  uploadBtn: { marginTop: 16, backgroundColor: "#FF9800", padding: 12, borderRadius: 10, alignItems: "center" },
  registerBtn: { marginTop: 20, backgroundColor: "#2196F3", padding: 14, borderRadius: 10, alignItems: "center" },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
