// services/sosService.ts
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Camera as ExpoCamera } from 'expo-camera';
import React from 'react';

const SOS_API = 'https://your-backend.com/api/sos';
let lastBlockHash = 'GENESIS';

const createBlockchainRecord = async (data: any) => {
  const json = JSON.stringify(data);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    lastBlockHash + json
  );
  const prevHash = lastBlockHash;
  lastBlockHash = hash;
  return { ...data, blockHash: hash, prevHash };
};

// Audio recording
export const recordAudio = async (): Promise<string> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return '';

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    await new Promise((res) => setTimeout(res, 10000));
    await recording.stopAndUnloadAsync();

    return recording.getURI() ?? '';
  } catch (err) {
    console.error('Audio recording failed:', err);
    return '';
  }
};

// Video recording
export const recordVideo = async (
  cameraRef: React.RefObject<ExpoCamera>,
  duration = 10
): Promise<string> => {
  if (!cameraRef.current) return '';
  try {
    const video = await cameraRef.current.recordAsync({ maxDuration: duration });
    return video.uri;
  } catch (err) {
    console.error('Video recording failed:', err);
    return '';
  }
};

// Trigger SOS
export const triggerSOS = async (
  score: number,
  reason: string,
  location: { latitude: number; longitude: number },
  cameraRef?: React.RefObject<ExpoCamera>
) => {
  try {
    const audioFile = await recordAudio();
    let videoFile = '';
    if (cameraRef) videoFile = await recordVideo(cameraRef, 10);

    const sosData = { timestamp: Date.now(), score, reason, location, audioFile, videoFile };
    const block = await createBlockchainRecord(sosData);

    await fetch(SOS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block),
    });

    Alert.alert('🚨 SOS Triggered', 'Alert sent securely.');
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to trigger SOS.');
  }
};
