// services/sosService.js
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { startAudioRecording, stopAudioRecording } from "./audioService";
import { startVideoRecording, stopVideoRecording } from "./videoService";

export async function triggerSOS(worryScore, reason, location) {
  try {
    // Start audio immediately
    await startAudioRecording();

    // (Optional) Start video if camera available
    const videoPath = await startVideoRecording();

    // Stop after 10s demo recording
    setTimeout(async () => {
      const audioPath = await stopAudioRecording();
      await stopVideoRecording();

      // Store locally first
      const payload = {
        worryScore,
        reason,
        location,
        audio: audioPath,
        video: videoPath,
        timestamp: Date.now(),
      };

      // Save to SecureStore queue if offline
      const queue = JSON.parse(await SecureStore.getItemAsync("sosQueue")) || [];
      queue.push(payload);
      await SecureStore.setItemAsync("sosQueue", JSON.stringify(queue));

      console.log("SOS stored locally:", payload);
    }, 10000);
  } catch (err) {
    console.error("SOS trigger error:", err);
  }
}
