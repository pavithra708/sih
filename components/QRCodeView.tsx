import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeViewProps {
  data: string; // The stringified data (could be userId, publicKey, tripId, etc.)
  size?: number;
}

/**
 * QRCodeView
 * Generates a QR code for tourist digital ID verification
 */
const QRCodeView: React.FC<QRCodeViewProps> = ({ data, size = 200 }) => {
  if (!data) return null; // Prevent empty QR

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <QRCode value={data} size={size} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default QRCodeView;
