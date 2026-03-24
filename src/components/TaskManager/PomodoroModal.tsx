"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { X, Play, Pause, RotateCcw, FastForward } from "lucide-react";

export function PomodoroModal({ onClose }: { onClose: () => void }) {
  const { settings } = useStore();
  const [mode, setMode] = useState<"work" | "break" | "longbreak">("work");
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intRef = useRef<NodeJS.Timeout | null>(null);

  const DURATIONS = { work: 25 * 60, break: 5 * 60, longbreak: 15 * 60 };

  useEffect(() => {
    if (running) {
      intRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(intRef.current as NodeJS.Timeout);
            setRunning(false);
            if (mode === "work") setSessions(n => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intRef.current) clearInterval(intRef.current);
    }
    return () => { if (intRef.current) clearInterval(intRef.current); };
  }, [running, mode]);

  const switchMode = (m: "work"|"break"|"longbreak") => {
    setMode(m);
    setSecs(DURATIONS[m]);
    setRunning(false);
  };

  const mins = String(Math.floor(secs / 60)).padStart(2, "0");
  const secStr = String(secs % 60).padStart(2, "0");
  const pct = (secs / DURATIONS[mode]) * 100;
  
  const r = 90;
  const circ = 2 * Math.PI * r;

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full h-[80vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative flex flex-col items-center" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: bgColAlt }} />
        
        <div className="w-full flex justify-between items-center mb-8 mt-4">
          <h2 className="text-xl font-bold ml-2">Focus Timer</h2>
          <button onClick={onClose} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition"><X size={20} color={textCol}/></button>
        </div>

        <div className="flex gap-2 p-1 rounded-full mb-12 w-full max-w-sm" style={{ backgroundColor: bgColAlt }}>
          {(["work", "break", "longbreak"] as const).map(m => (
            <button 
              key={m} 
              onClick={() => switchMode(m)}
              className="flex-1 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: mode === m ? settings.accentColor : "transparent",
                color: mode === m ? "#000" : textCol,
              }}
            >
              {m === 'work' ? 'Focus' : m === 'break' ? 'Short Break' : 'Long Break'}
            </button>
          ))}
        </div>

        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
          <svg width="256" height="256" className="absolute inset-0 -rotate-90">
            <circle cx="128" cy="128" r={r} fill="none" strokeWidth="12" style={{ stroke: bgColAlt }} />
            <circle 
              cx="128" cy="128" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
              style={{ 
                stroke: settings.accentColor, 
                strokeDasharray: circ, 
                strokeDashoffset: circ * (1 - pct / 100),
                transition: "stroke-dashoffset 1s linear"
              }} 
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-6xl font-black font-mono tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
              {mins}:{secStr}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest mt-2" style={{ color: settings.accentColor }}>
              {mode === "work" ? "Stay focused" : "Relax"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <button onClick={() => { setSecs(DURATIONS[mode]); setRunning(false); }} className="w-14 h-14 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition" style={{ borderColor: bgColAlt }}>
            <RotateCcw size={24} />
          </button>
          <button onClick={() => setRunning(!running)} className="w-24 h-24 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" style={{ backgroundColor: settings.accentColor, color: "#000" }}>
            {running ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          <button onClick={() => switchMode(mode === "work" ? "break" : "work")} className="w-14 h-14 rounded-full flex items-center justify-center border-2 hover:opacity-80 transition" style={{ borderColor: bgColAlt }}>
            <FastForward size={24} fill="currentColor" />
          </button>
        </div>

        <div className="text-center font-medium" style={{ color: bgColAlt }}>
          <span className="text-gray-500">Focus Sessions Today: </span> 
          <span className="text-xl" style={{ color: settings.accentColor }}>{sessions}</span>
        </div>

      </div>
    </div>
  );
}
