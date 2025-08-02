import React from "react";
import { useAudio } from "@/hooks/useAudio";

interface AlarmModalProps {
  eventTitle: string
  eventTime: string
  soundUrl: string
  onDismiss: () => void
  onSnooze?: () => void
  eventCategory?: string
}

export function AlarmModal({ eventTitle, eventTime, soundUrl, onDismiss, onSnooze, eventCategory }: AlarmModalProps) {
  const { playAudio, stopAudio } = useAudio();
  const wakeLockRef = React.useRef<WakeLockSentinel | null>(null);
  const lowerCat = eventCategory?.toLowerCase();
  const isPrayerCategory = lowerCat === 'wake up' || lowerCat === 'sleep';

  const handleStartPrayer = () => {
    const type = lowerCat === 'wake up' ? 'morning' : 'night';
    window.open(`/?tab=prayers&type=${type}`, '_blank');
    onDismiss();
  };
  React.useEffect(() => {
    const requestWake = async () => {
      try {
        if (document.visibilityState === 'visible') {
          wakeLockRef.current = await (navigator as any).wakeLock?.request?.('screen');
        }
      } catch (err) {
        console.error('Wake lock failed', err);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestWake();
      } else if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((err) => {
          console.error('Wake lock release failed', err);
        });
        wakeLockRef.current = null;
      }
    };

    requestWake();
    document.addEventListener('visibilitychange', handleVisibility);
    playAudio(soundUrl, 1, true);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopAudio();
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((err) => {
          console.error('Wake lock release failed', err);
        });
      }
    };
  }, [soundUrl, playAudio, stopAudio]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4 animate-pulse max-w-sm w-full">
        <h2 className="text-2xl font-bold text-red-600">Alarm!</h2>
        <p className="text-lg text-gray-800">{eventTitle}</p>
        <p className="text-sm text-gray-500">{eventTime}</p>
        <div className="flex gap-3 pt-2">
          {isPrayerCategory && (
            <button onClick={handleStartPrayer} className="btn-dreamy-primary flex-1">
              Start Prayer
            </button>
          )}
          <button onClick={onDismiss} className="btn-dreamy flex-1">
            Dismiss
          </button>
          {onSnooze && (
            <button onClick={onSnooze} className="btn-dreamy flex-1">
              Snooze 5 min
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
