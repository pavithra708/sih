// src/utils/AppPermissions.ts
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

export async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
}

export async function requestGalleryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}
