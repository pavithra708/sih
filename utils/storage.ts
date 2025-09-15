// utils/storage.ts
import * as FileSystem from "expo-file-system";

const OFFLINE_DIR = FileSystem.documentDirectory + "offline/";

export async function saveOfflineData(fileName: string, data: any) {
  try {
    await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
    const path = OFFLINE_DIR + fileName;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
    console.log("✅ Offline data saved:", path);
  } catch (err) {
    console.error("❌ Error saving offline data:", err);
  }
}
