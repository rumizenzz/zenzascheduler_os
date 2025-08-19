import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

interface Sound {
  id: string;
  name: string;
  src: string;
  key: string;
}

const keyMap = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];

const defaultSlots: (Sound | null)[] = Array(12).fill(null);
defaultSlots[0] = {
  id: "chime",
  name: "Chime",
  src: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
  key: keyMap[0],
};
defaultSlots[1] = {
  id: "beep",
  name: "Beep",
  src: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  key: keyMap[1],
};

export function SoundboardModule() {
  const [slots, setSlots] = useState<(Sound | null)[]>(defaultSlots);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  const play = (index: number) => {
    const sound = slots[index];
    if (!sound) return;
    const audio = new Audio(sound.src);
    void audio.play();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = keyMap.indexOf(e.key);
      if (idx !== -1) {
        play(idx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slots]);

  const handleFileChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, "");
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = {
        id: `${name}-${Date.now()}`,
        name,
        src: url,
        key: keyMap[index],
      };
      return copy;
    });
  };

  const removeSound = (index: number) => {
    const sound = slots[index];
    if (sound && sound.src.startsWith("blob:")) {
      URL.revokeObjectURL(sound.src);
    }
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-700">Soundboard</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {slots.map((sound, idx) => (
          <div key={idx} className="relative">
            {sound ? (
              <button
                onClick={() => play(idx)}
                className="w-full aspect-square rounded-lg bg-purple-200 hover:bg-purple-300 transition-colors flex items-center justify-center text-lg font-medium relative"
              >
                <span className="absolute top-1 left-2 text-xs text-purple-700">
                  {sound.key}
                </span>
                {sound.name}
                <X
                  className="absolute top-1 right-1 w-4 h-4 text-purple-700 hover:text-purple-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSound(idx);
                  }}
                />
              </button>
            ) : (
              <button
                onClick={() => fileInputs.current[idx]?.click()}
                className="w-full aspect-square rounded-lg border-2 border-dashed border-purple-300 text-purple-300 hover:border-purple-400 hover:text-purple-400 flex items-center justify-center"
              >
                <Plus className="w-8 h-8" />
              </button>
            )}
            <input
              type="file"
              accept="audio/*"
              ref={(el) => (fileInputs.current[idx] = el)}
              onChange={handleFileChange(idx)}
              className="hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

