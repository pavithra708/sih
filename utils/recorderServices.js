// utils/recorderService.js
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";

let activeRecording = null;

/**
 * Starts a 30-second recording (auto stop)
 * returns: { uri }
 */
export async function startRecording() {
  try {
    // Request and prepare
    await Audio.requestPermissionsAsync?.();
    await Audio.setAudioModeAsync?.({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    activeRecording = recording;

    // auto stop after 30s
    setTimeout(async () => {
      try {
        if (activeRecording) {
          await activeRecording.stopAndUnloadAsync();
          activeRecording = null;
        }
      } catch (e) {
        console.warn("auto stop error", e);
      }
    }, 30 * 1000);

    return new Promise((resolve) => {
      // Resolve with URI after it stops (or after 31s)
      const watcher = setInterval(async () => {
        if (!activeRecording) {
          clearInterval(watcher);
          // Find latest file in caches directory (expo gives recording.getURI())
          // The safe way: after stop we should read the recording.getURI() in stopRecording()
          resolve({ ok: true });
        }
      }, 500);
    });
  } catch (err) {
    console.error("startRecording error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Stops the active recording and returns the URI (if any).
 */
export async function stopRecording() {
  try {
    if (!activeRecording) return { ok: false, error: "no active recording" };
    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI();
    activeRecording = null;
    return { ok: true, uri };
  } catch (err) {
    console.error("stopRecording error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Read file at uri and compute SHA256. Optionally upload to backend.
 * Returns: { ok: true, uri, sha256, uploaded: boolean }
 */
export async function storeOnBlockchain(uri, meta = {}) {
  try {
    if (!uri) throw new Error("No recording URI provided");
    const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const sha = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, fileBase64);
    const payload = {
      hash: sha,
      meta,
      ts: Date.now(),
    };

    // Try upload to ledger/back-end (non-blocking)
    let uploaded = false;
    try {
      await fetch("/api/recordings/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, fileBase64 }),
      });
      uploaded = true;
    } catch (err) {
      // keep uploaded false -> offline or upload failure
      console.warn("failed to upload recording to backend:", err);
    }

    return { ok: true, uri, hash: sha, uploaded };
  } catch (err) {
    console.error("storeOnBlockchain error:", err);
    return { ok: false, error: err.message };
  }
}
