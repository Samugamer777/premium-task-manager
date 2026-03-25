"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { X, Moon, Sun, Download, Upload, Palette } from "lucide-react";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings, tasks, categories } = useStore();
  
  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const THEMES = [
    { name: "Green", color: "#30D158" },
    { name: "Blue", color: "#0A84FF" },
    { name: "Purple", color: "#BF5AF2" },
    { name: "Red", color: "#FF453A" },
    { name: "Orange", color: "#FF9F0A" },
    { name: "Pink", color: "#FF375F" }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateSettings({ profilePhoto: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const exportBackup = () => {
    const state = useStore.getState();
    const data = JSON.stringify({ tasks: state.tasks, categories: state.categories, settings: state.settings, stats: state.stats });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focustask-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (d.tasks) useStore.setState({ tasks: d.tasks, categories: d.categories || categories, settings: d.settings || settings, stats: d.stats || useStore.getState().stats });
        alert("Backup imported successfully!");
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const inputStyle = { background: bgColAlt, border: `1px solid ${borderCol}`, color: textCol };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />
        
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">Settings & Profile</h2>
          <button onClick={onClose} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition"><X size={20} color={textCol}/></button>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Profile</label>
            <div className="flex items-center gap-4">
              <label className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2" style={{ borderColor: settings.accentColor, background: bgColAlt }}>
                {settings.profilePhoto ? <img src={settings.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-2xl">📸</span>}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <input value={settings.userName} onChange={e => updateSettings({ userName: e.target.value })} className="flex-1 p-4 rounded-xl outline-none font-bold text-lg" style={inputStyle} />
            </div>
          </div>

          {/* Appearance Section */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Appearance</label>
            <div className="flex gap-3 mb-4">
              <button onClick={() => updateSettings({ darkMode: true })} className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 border-2 transition ${settings.darkMode ? 'border-current' : 'border-transparent'}`} style={{ borderColor: settings.darkMode ? settings.accentColor : borderCol, background: settings.darkMode ? `${settings.accentColor}22` : bgColAlt }}>
                <Moon size={24} color={settings.darkMode ? settings.accentColor : textCol}/> <span className="text-sm font-semibold" style={{ color: settings.darkMode ? settings.accentColor : textCol }}>Dark Mode</span>
              </button>
              <button onClick={() => updateSettings({ darkMode: false })} className={`flex-1 p-4 rounded-xl flex flex-col items-center gap-2 border-2 transition ${!settings.darkMode ? 'border-current' : 'border-transparent'}`} style={{ borderColor: !settings.darkMode ? settings.accentColor : borderCol, background: !settings.darkMode ? `${settings.accentColor}22` : bgColAlt }}>
                <Sun size={24} color={!settings.darkMode ? settings.accentColor : textCol}/> <span className="text-sm font-semibold" style={{ color: !settings.darkMode ? settings.accentColor : textCol }}>Light Mode</span>
              </button>
            </div>

            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Theme Color</label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <button 
                  key={theme.color} 
                  onClick={() => updateSettings({ accentColor: theme.color })} 
                  className="p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition" 
                  style={{ borderColor: settings.accentColor === theme.color ? theme.color : borderCol, background: settings.accentColor === theme.color ? `${theme.color}22` : bgColAlt }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.color }} />
                  <span className="text-xs font-semibold" style={{ color: settings.accentColor === theme.color ? textCol : textCol }}>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language & Weekly Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Language / Idioma</label>
            <div className="flex gap-3 mb-4">
              <button onClick={() => updateSettings({ language: 'en' })} className="flex-1 p-3 rounded-xl flex items-center justify-center gap-2 border-2 transition font-bold text-sm" style={{ borderColor: settings.language === 'en' ? settings.accentColor : borderCol, background: settings.language === 'en' ? `${settings.accentColor}22` : bgColAlt, color: settings.language === 'en' ? settings.accentColor : textCol }}>
                🇺🇸 English
              </button>
              <button onClick={() => updateSettings({ language: 'es' })} className="flex-1 p-3 rounded-xl flex items-center justify-center gap-2 border-2 transition font-bold text-sm" style={{ borderColor: settings.language === 'es' ? settings.accentColor : borderCol, background: settings.language === 'es' ? `${settings.accentColor}22` : bgColAlt, color: settings.language === 'es' ? settings.accentColor : textCol }}>
                🇪🇸 Español
              </button>
            </div>

            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Weekly Goal (tasks per week)</label>
            <input type="number" min={1} max={100} value={settings.weeklyGoal ?? 10} onChange={e => updateSettings({ weeklyGoal: Number(e.target.value) || 10 })} className="w-full p-4 rounded-xl outline-none font-bold text-lg" style={inputStyle} />
          </div>

          {/* Backup Section */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Data Sync & Backup</label>
            <div className="flex gap-3">
              <button onClick={exportBackup} className="flex-1 p-4 rounded-xl flex flex-col items-center gap-2 border border-transparent hover:opacity-80 transition" style={{ background: bgColAlt, color: textCol }}>
                <Download size={24} /> <span className="text-sm font-semibold">Export JSON</span>
              </button>
              <label className="flex-1 p-4 rounded-xl flex flex-col items-center gap-2 border border-transparent hover:opacity-80 transition cursor-pointer" style={{ background: bgColAlt, color: textCol }}>
                <Upload size={24} /> <span className="text-sm font-semibold">Import JSON</span>
                <input type="file" accept=".json" onChange={importBackup} className="hidden" />
              </label>
            </div>
            <p className="text-xs mt-3 opacity-60 text-center">Data is saved automatically in your browser.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
