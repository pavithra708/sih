import Voice from "@react-native-voice/voice";

let onResultCallback;
let onErrorCallback;

// Initialize voice recognition
export function initSpeech(onResult, onError) {
  onResultCallback = onResult;
  onErrorCallback = onError;

  Voice.onSpeechResults = (event) => {
    if (event.value) onResultCallback(event.value);
  };
  Voice.onSpeechError = (event) => {
    if (event.error) onErrorCallback(event.error);
  };
}

// Start listening
export async function startListening(language = "en-US") {
  try {
    await Voice.start(language);
  } catch (e) {
    console.error("Voice start error:", e);
  }
}

// Stop listening
export async function stopListening() {
  try {
    await Voice.stop();
  } catch (e) {
    console.error("Voice stop error:", e);
  }
}
