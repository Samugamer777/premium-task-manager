"use client";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { X, Lock, Trophy } from "lucide-react";

export function AchievementsModal({ onClose }: { onClose: () => void }) {
  const { achievements, settings, checkAchievements } = useStore();

  useEffect(() => { checkAchievements(); }, [checkAchievements]);

  const unlocked = achievements.filter(a => a.unlockedAt);
  const locked = achievements.filter(a => !a.unlockedAt);

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />

        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">🏆 Achievements</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: bgColAlt }}><X size={20} color={textCol} /></button>
        </div>

        <div className="text-center mb-6 p-4 rounded-2xl" style={{ backgroundColor: `${settings.accentColor}11`, border: `1px solid ${settings.accentColor}22` }}>
          <p className="text-3xl font-black" style={{ color: settings.accentColor }}>{unlocked.length}/{achievements.length}</p>
          <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: textSec }}>Badges Unlocked</p>
        </div>

        {unlocked.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: settings.accentColor }}>Unlocked</h3>
            <div className="grid grid-cols-2 gap-3">
              {unlocked.map(a => (
                <div key={a.id} className="p-4 rounded-2xl text-center" style={{ backgroundColor: `${settings.accentColor}11`, border: `1px solid ${settings.accentColor}22` }}>
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="text-[10px] mt-1" style={{ color: textSec }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: textSec }}>Locked</h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(a => (
              <div key={a.id} className="p-4 rounded-2xl text-center opacity-40" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
                <div className="text-3xl mb-2 grayscale">🔒</div>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-[10px] mt-1" style={{ color: textSec }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
