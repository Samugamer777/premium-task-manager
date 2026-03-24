"use client";
import { useStore } from "@/store/useStore";
import { Bell, User, Settings as SettingsIcon } from "lucide-react";

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { tasks, settings, stats } = useStore();
  const T = settings.darkMode ? "bg-black text-white" : "bg-[#F2F2F7] text-black";

  const total = tasks.length;
  const doneC = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((doneC / total) * 100) : 0;

  return (
    <div className={`p-6 pb-2`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
            {settings.profilePhoto ? (
              <img src={settings.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Good morning,</p>
            <h1 className="text-2xl font-black">{settings.userName}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition">
            <Bell size={18} />
          </button>
          <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition">
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#1C1C1E] p-4 rounded-2xl shadow-lg border border-gray-800" style={{ boxShadow: !settings.darkMode ? "0 4px 12px rgba(0,0,0,0.05)" : undefined, backgroundColor: settings.darkMode ? "#1C1C1E" : "#FFFFFF" }}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: settings.accentColor }}>{doneC}</span>
            <span className="text-sm font-medium text-gray-400">/ {total} tasks completed</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-400">🔥 {stats.streak} day streak</div>
          </div>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-500 ease-out" style={{ width: `${pct}%`, backgroundColor: settings.accentColor }} />
        </div>
      </div>
    </div>
  );
}
