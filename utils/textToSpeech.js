import * as Speech from "expo-speech";

// Speak a given text in selected language
export function speak(text, language = "en") {
  const langMap = {
    en: "en-US",
    hi: "hi-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    ml: "ml-IN",
  };
  Speech.speak(text, {
    language: langMap[language] || "en-US",
    pitch: 1.0,
    rate: 1.0,
  });
}
