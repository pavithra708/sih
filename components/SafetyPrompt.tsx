import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { speak } from "../utils/textToSpeech";

interface SafetyPromptProps {
  visible: boolean;
  onYes?: () => void;
  onNo?: (autoTriggered?: boolean) => void;
  onIgnore?: () => void;
  language?: string;
}

export default function SafetyPrompt({
  visible,
  onYes,
  onNo,
  onIgnore,
  language = "en",
}: SafetyPromptProps) {
  useEffect(() => {
    if (!visible) return;

    speak("Are you safe?", language);

    const timer = setTimeout(() => {
      onNo?.(true); // auto timeout after 10s
    }, 10000);

    return () => clearTimeout(timer);
  }, [visible, onNo, language]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Are you safe?</Text>

          <TouchableOpacity style={[styles.btn, styles.safe]} onPress={onYes}>
            <Text style={styles.btnText}>✅ Yes, I'm safe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.unsafe]} onPress={() => onNo?.(false)}>
            <Text style={styles.btnText}>⚠️ I'm not safe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.ignore]} onPress={onIgnore}>
            <Text style={styles.btnText}>⏸️ Ignore</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "85%", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  btn: { width: "100%", padding: 12, borderRadius: 8, marginVertical: 6, alignItems: "center" },
  safe: { backgroundColor: "#2ecc71" },
  unsafe: { backgroundColor: "#F44336" },
  ignore: { backgroundColor: "#FFC107" },
  btnText: { color: "#fff", fontWeight: "700" },
});
