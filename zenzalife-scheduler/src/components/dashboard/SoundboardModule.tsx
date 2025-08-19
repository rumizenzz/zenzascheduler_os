import React, { useState } from "react";

interface Sound {
  id: string;
  name: string;
  src: string;
}

export function SoundboardModule() {
  const [sounds, setSounds] = useState<Sound[]>([
    {
      id: "chime",
      name: "Chime",
      src: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
    },
    {
      id: "beep",
      name: "Beep",
      src: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    },
  ]);

  const addSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, "");
    setSounds((prev) => [...prev, { id: `${name}-${Date.now()}`, name, src: url }]);
  };

  const play = (src: string) => {
    const audio = new Audio(src);
    void audio.play();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-700">Soundboard</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sounds.map((s) => (
          <button
            key={s.id}
            onClick={() => play(s.src)}
            className="p-4 rounded-lg bg-purple-200 hover:bg-purple-300 transition-colors"
          >
            {s.name}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Add Sound</label>
        <input type="file" accept="audio/*" onChange={addSound} />
      </div>
    </div>
  );
}

