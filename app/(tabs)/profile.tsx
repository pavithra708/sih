import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import QRCodeView from "../../components/QRCodeView";
import { User, Phone, Mail, MapPin, Users } from "lucide-react-native";

// Define TypeScript types
type EmergencyContact = {
  name?: string;
  phone?: string;
  relationship?: string;
};

type TouristProfile = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  tripEndDate?: string;
  itinerary?: string[];
  emergencyContacts?: EmergencyContact[];
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { tourist, isLoading } = useAuth() as { tourist?: TouristProfile; isLoading: boolean };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading profile...</Text>
      </View>
    );
  }

  if (!tourist) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profile not found. Please log in.</Text>
      </View>
    );
  }

  const rawId = tourist.id ? String(tourist.id) : "UNKNOWN";
  const shortId = rawId.slice(-8).toUpperCase();

  const qrData = JSON.stringify({
    id: rawId,
    name: tourist.name || "N/A",
    validUntil: tourist.tripEndDate || null,
  });

  const itineraryText = Array.isArray(tourist.itinerary) && tourist.itinerary.length > 0
    ? tourist.itinerary.join(", ")
    : "N/A";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("profile.digitalId")}</Text>

      <View style={styles.idCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Digital Tourist ID</Text>
          <Text style={styles.cardId}>ID: {shortId}</Text>
        </View>

        <QRCodeView data={qrData} size={150} />

        <Text style={styles.scanText}>{t("profile.scanCode")}</Text>
        {tourist.tripEndDate && (
          <Text style={styles.validText}>
            {t("profile.validUntil")}:{" "}
            {new Date(tourist.tripEndDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* --- Details Section --- */}
      <View style={styles.detailsSection}>
        <Detail
          icon={<User size={20} color="#2196F3" />}
          label="Name"
          value={tourist.name || "N/A"}
        />
        <Detail
          icon={<Phone size={20} color="#2196F3" />}
          label="Phone"
          value={tourist.phone || "N/A"}
        />
        <Detail
          icon={<Mail size={20} color="#2196F3" />}
          label="Email"
          value={tourist.email || "N/A"}
        />
        <Detail
          icon={<MapPin size={20} color="#2196F3" />}
          label={t("profile.itinerary")}
          value={itineraryText}
        />
      </View>

      {/* --- Emergency Contacts --- */}
      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>{t("profile.emergencyContacts")}</Text>
        {Array.isArray(tourist.emergencyContacts) && tourist.emergencyContacts.length > 0 ? (
          tourist.emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <Users size={20} color="#FF9800" />
              <View style={styles.contactContent}>
                <Text style={styles.contactName}>{contact.name || "N/A"}</Text>
                <Text style={styles.contactPhone}>{contact.phone || "N/A"}</Text>
                <Text style={styles.contactRelation}>{contact.relationship || "N/A"}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: "#999", fontSize: 14 }}>
            No emergency contacts available
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

// --- Detail component ---
function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.detailItem}>
      {icon}
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingTop: 50 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  idCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  cardHeader: { alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardId: { fontSize: 12, color: "#666", fontFamily: "monospace", marginTop: 4 },
  scanText: { fontSize: 14, color: "#666", marginTop: 12, textAlign: "center" },
  validText: { fontSize: 12, color: "#999", marginTop: 8 },
  detailsSection: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  detailItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  detailContent: { flex: 1, marginLeft: 12 },
  detailLabel: { fontSize: 12, color: "#666", marginBottom: 2 },
  detailValue: { fontSize: 16, color: "#333", fontWeight: "500" },
  emergencySection: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 16 },
  contactItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  contactContent: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  contactPhone: { fontSize: 14, color: "#666", marginBottom: 2 },
  contactRelation: { fontSize: 12, color: "#999" },
  errorText: { fontSize: 16, color: "#F44336", textAlign: "center" },
});
