// components/useRecorder.tsx
import { useState, useCallback } from "react";
import * as FileSystem from "expo-file-system";
import { saveOfflineData } from "../utils/storage";

type UseRecorderReturn = {
  isRecording: boolean;
  startAutoRecording: (maxDurationSeconds?: number) => Promise<string | null>;
  stopRecording: () => void;
};

/**
 * cameraRef: should be a ref to expo-camera's Camera component
 */
export default function useRecorder(cameraRef: React.RefObject<any>): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);

  const startAutoRecording = useCallback(
    async (maxDurationSeconds = 30) => {
      if (!cameraRef.current || isRecording) return null;

      try {
        setIsRecording(true);

        // Start recording
        const video: { uri?: string } | null = await cameraRef.current.recordAsync?.({
          maxDuration: maxDurationSeconds,
          mute: false,
        });

        if (!video?.uri) {
          console.warn("No URI returned from recordAsync");
          setIsRecording(false);
          return null;
        }

        // Ensure recordings folder exists
        const recordingsFolder = FileSystem.documentDirectory + "recordings/";
        const folderInfo = await FileSystem.getInfoAsync(recordingsFolder);
        if (!folderInfo.exists) {
          await FileSystem.makeDirectoryAsync(recordingsFolder, { intermediates: true });
        }

        // Move the temp video to persistent folder
        const fileName = `recording_${Date.now()}.mp4`;
        const newPath = recordingsFolder + fileName;

        try {
          await FileSystem.moveAsync({ from: video.uri, to: newPath });
        } catch (e) {
          console.warn("Could not move video, using original URI:", e);
          await saveOfflineData(`recording_${Date.now()}.json`, {
            uri: video.uri,
            ts: Date.now(),
            type: "video",
          });
          setIsRecording(false);
          return video.uri ?? null;
        }

        // Save metadata JSON
        await saveOfflineData(`${fileName}.json`, { uri: newPath, timestamp: Date.now(), type: "video" });

        setIsRecording(false);
        return newPath;
      } catch (err) {
        console.error("startAutoRecording error:", err);
        try {
          cameraRef.current?.stopRecording?.();
        } catch {}
        setIsRecording(false);
        return null;
      }
    },
    [cameraRef, isRecording]
  );

  const stopRecording = useCallback(() => {
    try {
      if (cameraRef.current && isRecording) {
        cameraRef.current.stopRecording?.();
      }
    } catch (e) {
      console.warn("stopRecording error:", e);
    } finally {
      setIsRecording(false);
    }
  }, [cameraRef, isRecording]);

  return { isRecording, startAutoRecording, stopRecording };
}
