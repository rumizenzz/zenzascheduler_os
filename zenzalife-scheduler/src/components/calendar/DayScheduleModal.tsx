import React from "react";
import dayjs from "dayjs";
import { X, Calendar } from "lucide-react";

interface DayEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface DayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  events: DayEvent[];
}

export function DayScheduleModal({ isOpen, onClose, date, events }: DayScheduleModalProps) {
  if (!isOpen) return null;

  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              {dayjs(date).format("MMM D, YYYY")}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-2">
            {sorted.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-2 p-2 rounded-lg text-xs shadow"
                style={{ backgroundColor: ev.backgroundColor, border: `1px solid ${ev.borderColor}`, color: ev.textColor || "#374151" }}
              >
                <span className="flex-1 truncate">{ev.title}</span>
                <span className="whitespace-nowrap">
                  {dayjs(ev.start).format("h:mm A")}
                  {ev.end ? ` – ${dayjs(ev.end).format("h:mm A")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
