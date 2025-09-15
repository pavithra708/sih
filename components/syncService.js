// services/syncService.js
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";

export async function syncSOSQueue() {
  const queue = JSON.parse(await SecureStore.getItemAsync("sosQueue")) || [];

  for (let payload of queue) {
    try {
      let formData = new FormData();
      formData.append("worryScore", payload.worryScore);
      formData.append("reason", payload.reason);
      formData.append("location", JSON.stringify(payload.location));
      if (payload.audio)
        formData.append("audio", {
          uri: payload.audio,
          type: "audio/m4a",
          name: "sos_audio.m4a",
        });
      if (payload.video)
        formData.append("video", {
          uri: payload.video,
          type: "video/mp4",
          name: "sos_video.mp4",
        });

      await fetch("http://localhost:3001/api/sos/trigger", {
        method: "POST",
        body: formData,
      });

      console.log("Uploaded SOS:", payload);
    } catch (err) {
      console.error("Upload failed, keeping in queue", err);
    }
  }

  // Clear after successful upload
  await SecureStore.setItemAsync("sosQueue", JSON.stringify([]));
}
