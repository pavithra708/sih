import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Shield, MapPin, AlertTriangle, CheckCircle, Languages } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { useSafety } from "../../contexts/SafetyContext";
import SafetyPrompt from "../../components/SafetyPrompt";
import { geofenceService } from "../../services/geofenceService";

import { useTranslation } from "react-i18next";
import { Picker } from "@react-native-picker/picker";

type Zone = { name: string; riskLevel: "low" | "medium" | "high" };

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ml", label: "മലയാളം" },
  { code: "or", label: "ଓଡ଼ିଆ" },
];

export default function HomeScreen() {
  const { t, i18n } = useTranslation();

  const { tourist } = useAuth() as any;
  const { currentLocation } = useLocation();
  const {
    worryScore,
    showPrompt,
    setShowPrompt,
    handlePromptYes,
    handlePromptNo,
    triggerManualSOS,
  } = useSafety();

  const [refreshing, setRefreshing] = useState(false);
  const [zone, setZone] = useState<Zone | null>(null);
  const ignoreUntilRef = useRef<number>(0);
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  useEffect(() => {
    if (!currentLocation) return;

    const currentZone = geofenceService.checkLocation(currentLocation) as Zone;
    setZone(currentZone);

    const now = Date.now();
    if (
      now > ignoreUntilRef.current &&
      (currentZone?.riskLevel === "medium" || currentZone?.riskLevel === "high")
    ) {
      setShowPrompt(true);
    }
  }, [currentLocation, setShowPrompt]);

  // Change language using i18n from useTranslation()
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setSelectedLang(langCode);
  };

  const safeScore = Math.min(100, Math.max(0, worryScore));
  const getScoreColor = (score: number) =>
    score >= 80 ? "#F44336" : score >= 30 ? "#FF9800" : "#4CAF50";

  const zoneStatus = !zone
    ? {
        icon: CheckCircle,
        color: "#4CAF50",
        title: t("home.safeZone"),
        message: t("home.safeMessage"),
      }
    : {
        icon: AlertTriangle,
        color: zone.riskLevel === "high" ? "#F44336" : "#FF9800",
        title:
          zone.riskLevel === "high"
            ? t("home.dangerZone")
            : t("home.cautionZone"),
        message: `${t("home.exitZone")}: ${zone.name}`,
      };

  const StatusIcon = zoneStatus.icon;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleIgnore = () => {
    ignoreUntilRef.current = Date.now() + 10 * 60 * 1000; // 10 minutes
    setShowPrompt(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Safety Dashboard Title */}
        <Text style={styles.title}>{t("home.title")}</Text>

        {/* Safety Score */}
        <View style={styles.scoreCard}>
          <Shield size={32} color={getScoreColor(safeScore)} />
          <View style={styles.scoreContent}>
            <Text style={styles.scoreTitle}>{t("home.safetyScore")}</Text>
            <Text
              style={[
                styles.scoreValue,
                { color: getScoreColor(safeScore) },
              ]}
            >
              {`${safeScore}/100`}
            </Text>
          </View>
        </View>

        {/* Geofence Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MapPin size={24} color="#2196F3" />
            <Text style={styles.statusTitle}>{t("home.geofence")}</Text>
          </View>
          <View style={styles.zoneStatus}>
            <StatusIcon size={20} color={zoneStatus.color} />
            <Text style={[styles.zoneText, { color: zoneStatus.color }]}>
              {zoneStatus.title}
            </Text>
          </View>
          <Text style={styles.zoneMessage}>{zoneStatus.message}</Text>
        </View>

        {/* Emergency Contacts */}
        {Array.isArray(tourist?.emergencyContacts) &&
        tourist.emergencyContacts.length ? (
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>
              {t("home.emergencyContacts")}
            </Text>
            {tourist.emergencyContacts.slice(0, 2).map((phone: string, i: number) => (
              <View key={i} style={styles.emergencyContact}>
                <Text style={styles.contactPhone}>{phone}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* SOS Button */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <TouchableOpacity onPress={triggerManualSOS} style={styles.bigSosButton}>
            <Text style={styles.bigSosText}>🚨 SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Language Selector - moved BELOW SOS */}
        <View style={styles.languageSelectorContainer}>
          <View style={styles.languageHeader}>
            <Languages size={20} color="#2196F3" />
            <Text style={styles.languageSelectorLabel}>
              {t("settings.language")}
            </Text>
          </View>
          <View style={styles.languagePickerWrapper}>
            <Picker
              selectedValue={selectedLang}
              onValueChange={(value) => changeLanguage(value)}
              mode="dropdown"
              style={
                Platform.OS === "ios" ? styles.pickerIOS : styles.pickerAndroid
              }
            >
              {languages.map((lang) => (
                <Picker.Item
                  key={lang.code}
                  label={lang.label}
                  value={lang.code}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Safety Prompt Modal */}
        <SafetyPrompt
          visible={showPrompt}
          onYes={handlePromptYes}
          onNo={handlePromptNo}
          onIgnore={handleIgnore}
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
  contactPhone: { fontSize: 14, fontWeight: "600" },
  bigSosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bigSosText: { color: "#fff", fontSize: 32, fontWeight: "bold", letterSpacing: 1 },
  languageSelectorContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  languageSelectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  languagePickerWrapper: {
    backgroundColor: "#fdcfcfff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  pickerIOS: {
    height: 150,
    width: "100%",
  },
  pickerAndroid: {
    height: 70,
    width: "100%",
  },
});
