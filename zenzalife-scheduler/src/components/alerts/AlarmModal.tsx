import React from "react";
import { useAudio } from "@/hooks/useAudio";

interface AlarmModalProps {
  eventTitle: string;
  eventTime: string;
  soundUrl: string;
  onDismiss: () => void;
}

export function AlarmModal({ eventTitle, eventTime, soundUrl, onDismiss }: AlarmModalProps) {
  const { playAudio, stopAudio } = useAudio();
  React.useEffect(() => {
    playAudio(soundUrl, 1, true);
    return () => {
      stopAudio();
    };
  }, [soundUrl, playAudio, stopAudio]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4 animate-pulse">
        <h2 className="text-2xl font-bold text-red-600">Alarm!</h2>
        <p className="text-lg text-gray-800">{eventTitle}</p>
        <p className="text-sm text-gray-500">{eventTime}</p>
        <button onClick={onDismiss} className="btn-dreamy-primary w-full">
          Dismiss
        </button>
      </div>
    </div>
  );
}
