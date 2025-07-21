import { useState, useRef, useEffect } from "react";

export function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass =
      (
        window as unknown as {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = true;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript((prev) => (prev + " " + finalText).trim());
      }
    };

    recognitionRef.current.onend = () => {
      if (listening) recognitionRef.current?.start();
    };
  }, [listening]);

  const start = () => {
    if (recognitionRef.current && !listening) {
      setTranscript("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stop = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  return { listening, transcript, start, stop };
}
