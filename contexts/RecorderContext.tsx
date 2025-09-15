// contexts/RecorderContext.tsx
import React, { createContext, useContext, useRef } from "react";
import * as FileSystem from "expo-file-system";

type RecorderContextType = {
  cameraRef: React.MutableRefObject<any | null>;
  setCameraRef: (r: any | null) => void;
  startAutoRecording: (maxDurationSeconds?: number) => Promise<string | null>;
  moveTempUri?: (tempUri: string) => Promise<string | null>;
};

const RecorderContext = createContext<RecorderContextType | null>(null);

export const RecorderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cameraRef = useRef<any | null>(null);
  const recordingsFolder = FileSystem.documentDirectory + "recordings/";

  const setCameraRef = (r: any | null) => {
    cameraRef.current = r;
  };

  const ensureFolder = async () => {
    try {
      const info = await FileSystem.getInfoAsync(recordingsFolder);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(recordingsFolder, { intermediates: true });
      }
    } catch (e) {
      console.warn("RecorderProvider.ensureFolder error:", e);
    }
  };

  const moveTempUri = async (tempUri: string) => {
    try {
      if (!tempUri) return null;
      await ensureFolder();
      const dest = `${recordingsFolder}sos_${Date.now()}.mp4`;
      await FileSystem.moveAsync({ from: tempUri, to: dest });
      return dest;
    } catch (e) {
      console.warn("RecorderProvider.moveTempUri failed:", e);
      return null;
    }
  };

  const waitForCamera = async (timeoutMs = 3000) => {
    const start = Date.now();
    while (!cameraRef.current && Date.now() - start < timeoutMs) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 200));
    }
    return cameraRef.current;
  };

  const startAutoRecording = async (maxDurationSeconds = 30): Promise<string | null> => {
    const cam = await waitForCamera(3000);
    if (!cam) {
      console.warn("RecorderContext: camera not ready");
      return null;
    }

    try {
      const video = await cam.recordAsync({
        maxDuration: maxDurationSeconds,
        mute: false,
      } as any);
      const saved = await moveTempUri(video.uri);
      return saved ?? video.uri ?? null;
    } catch (err) {
      console.error("RecorderContext.startAutoRecording error:", err);
      try {
        cam?.stopRecording?.();
      } catch {}
      return null;
    }
  };

  return (
    <RecorderContext.Provider value={{ cameraRef, setCameraRef, startAutoRecording, moveTempUri }}>
      {children}
    </RecorderContext.Provider>
  );
};

export const useRecorderContext = (): RecorderContextType | null => {
  return useContext(RecorderContext);
};
