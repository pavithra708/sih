import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Shield, MapPin, AlertTriangle, CheckCircle } from "lucide-react-native";

import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { useSafety } from "../../contexts/SafetyContext";
import SafetyPrompt from "../../components/SafetyPrompt";
import { geofenceService } from "../../services/geofenceService";

type Zone = { name: string; riskLevel: "low" | "medium" | "high" };

export default function HomeScreen() {
  const { tourist } = useAuth() as any;
  const { currentLocation } = useLocation();
  const {
    worryScore,
    showPrompt,
    sosStatus,
    setShowPrompt,
    handlePromptYes,
    handlePromptNo,
    handlePromptIgnore,
    triggerManualSOS,
  } = useSafety();

  const [refreshing, setRefreshing] = useState(false);
  const [zone, setZone] = useState<Zone | null>(null);

  useEffect(() => {
    if (!currentLocation) return;

    const currentZone = geofenceService.checkLocation(currentLocation) as Zone;
    setZone(currentZone);

    if (currentZone?.riskLevel === "medium" || currentZone?.riskLevel === "high") {
      setShowPrompt(true);
    }
  }, [currentLocation, setShowPrompt]);

  const safeScore = Math.min(100, Math.max(0, worryScore));
  const getScoreColor = (score: number) =>
    score >= 80 ? "#F44336" : score >= 30 ? "#FF9800" : "#4CAF50";

  const zoneStatus = !zone
    ? { icon: CheckCircle, color: "#4CAF50", title: "Safe Zone", message: "You are safe" }
    : {
        icon: AlertTriangle,
        color: zone.riskLevel === "high" ? "#F44336" : "#FF9800",
        title: zone.riskLevel === "high" ? "Danger Zone" : "Caution Zone",
        message: `Exit zone: ${zone.name}`,
      };

  const StatusIcon = zoneStatus.icon;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Safety Dashboard</Text>

        {/* Safety Score */}
        <View style={styles.scoreCard}>
          <Shield size={32} color={getScoreColor(safeScore)} />
          <View style={styles.scoreContent}>
            <Text style={styles.scoreTitle}>Safety Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(safeScore) }]}>
              {`${safeScore}/100`}
            </Text>
          </View>
        </View>

        {/* Geofence Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MapPin size={24} color="#2196F3" />
            <Text style={styles.statusTitle}>Geofence</Text>
          </View>
          <View style={styles.zoneStatus}>
            <StatusIcon size={20} color={zoneStatus.color} />
            <Text style={[styles.zoneText, { color: zoneStatus.color }]}>{zoneStatus.title}</Text>
          </View>
          <Text style={styles.zoneMessage}>{zoneStatus.message}</Text>
        </View>

        {/* Emergency Contacts */}
        {Array.isArray(tourist?.emergencyContacts) && tourist.emergencyContacts.length ? (
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            {tourist.emergencyContacts.slice(0, 2).map((c: any, i: number) => (
              <View key={i} style={styles.emergencyContact}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* SOS Button */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <TouchableOpacity onPress={triggerManualSOS} style={styles.bigSosButton}>
            <Text style={styles.bigSosText}>🚨 SOS</Text>
          </TouchableOpacity>

          {/* Live SOS status */}
          {sosStatus ? (
            <View style={styles.sosStatusContainer}>
              <Text style={styles.sosStatusText}>{sosStatus}</Text>
            </View>
          ) : null}
        </View>

        {/* Safety Prompt Modal */}
        <SafetyPrompt
          visible={showPrompt}
          onYes={handlePromptYes}
          onNo={handlePromptNo}
          onIgnore={handlePromptIgnore}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreContent: { flex: 1, marginLeft: 12 },
  scoreTitle: { fontSize: 16 },
  scoreValue: { fontSize: 28, fontWeight: "bold" },
  statusCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusTitle: { fontSize: 16, fontWeight: "600", marginLeft: 8 },
  zoneStatus: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  zoneText: { fontSize: 14, fontWeight: "600", marginLeft: 6 },
  zoneMessage: { fontSize: 12, color: "#666" },
  emergencyCard: { backgroundColor: "#FFF3E0", borderRadius: 12, padding: 16, marginBottom: 16 },
  emergencyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  emergencyContact: { marginBottom: 6 },
  contactName: { fontSize: 14, fontWeight: "600" },
  contactPhone: { fontSize: 12 },
  bigSosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  bigSosText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  sosStatusContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
  },
  sosStatusText: { fontSize: 16, color: "#F44336", fontWeight: "600" },
});
