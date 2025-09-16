import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveOfflineData(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log("✅ Offline data saved:", key);
  } catch (err) {
    console.error("❌ saveOfflineData error:", err);
  }
}

export async function getAllOfflineData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(k => k.startsWith("offline_"));
    const items = await AsyncStorage.multiGet(offlineKeys);
    return items.map(([key, value]) => ({ key, data: JSON.parse(value!) }));
  } catch (err) {
    console.error("❌ getAllOfflineData error:", err);
    return [];
  }
}

export async function removeOfflineData(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error("❌ removeOfflineData error:", err);
  }
}
