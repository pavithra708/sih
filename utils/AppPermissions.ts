import { Camera } from "expo-camera";
import * as Location from "expo-location";

export async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
}

export async function requestMicrophonePermission() {
  const { status } = await Camera.requestMicrophonePermissionsAsync();
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
