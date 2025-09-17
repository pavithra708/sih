import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useTranslation } from "react-i18next";

// ✅ Import images at the top (safe way for Metro bundler)
import IdImage from "../../assets/images/safety/id.png";
import ZoneImage from "../../assets/images/safety/zone.png";
import LocationImage from "../../assets/images/safety/location.png";
import EmergencyImage from "../../assets/images/safety/emergency.png";

export default function SafetyScreen() {
  const { t } = useTranslation();

  const tips = [
    {
      key: "tip1",
      color: "#E3FCEF",
      icon: "🛂",
      title: t("safety.tip1Title") || "Keep ID Safe",
      desc:
        t("safety.tip1") ||
        "Always keep your Digital ID safe and never share with strangers.",
      image: IdImage,
    },
    {
      key: "tip2",
      color: "#FFF4E5",
      icon: "⚠️",
      title: t("safety.tip2Title") || "Avoid Risk Zones",
      desc:
        t("safety.tip2") ||
        "Stay away from high-risk or restricted zones for your safety.",
      image: ZoneImage,
    },
    {
      key: "tip3",
      color: "#E8F1FF",
      icon: "📍",
      title: t("safety.tip3Title") || "Track Location",
      desc:
        t("safety.tip3") ||
        "Always be aware of your current location on the map.",
      image: LocationImage,
    },
    {
      key: "tip4",
      color: "#FFE9E9",
      icon: "📞",
      title: t("safety.tip4Title") || "Emergency Contacts",
      desc:
        t("safety.tip4") ||
        "Save emergency contacts and use SOS button if in danger.",
      image: EmergencyImage,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {t("safety.tipsTitle") || "Travel Safety Tips"}
      </Text>

      {tips.map((tip) => (
        <View
          key={tip.key}
          style={[styles.card, { backgroundColor: tip.color }]}
        >
          <Image source={tip.image} style={styles.image} resizeMode="contain" />
          <View style={styles.textWrapper}>
            <Text style={styles.icon}>{tip.icon}</Text>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  content: { padding: 16, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 20,
     marginTop: 24
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 16,
  },
  textWrapper: { flex: 1 },
  icon: { fontSize: 22, marginBottom: 4 },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tipDesc: { fontSize: 14, color: "#555" },
});
