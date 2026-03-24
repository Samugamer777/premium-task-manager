"use client";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { X, AlertTriangle, Clock, CalendarClock } from "lucide-react";

export function NotificationsModal({ onClose, onOpenTask }: { onClose: () => void, onOpenTask: (id: number) => void }) {
  const { tasks, categories, settings } = useStore();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const notifications = useMemo(() => {
    const notifs: { id: number; taskId: number; type: "overdue" | "today" | "tomorrow"; title: string; due: string; catColor: string }[] = [];

    tasks.forEach(t => {
      if (t.done || !t.due) return;
      const cat = categories.find(c => c.id === t.categoryId);
      const color = cat?.color || settings.accentColor;

      if (t.due < today) {
        notifs.push({ id: t.id, taskId: t.id, type: "overdue", title: t.title, due: t.due, catColor: color });
      } else if (t.due === today) {
        notifs.push({ id: t.id, taskId: t.id, type: "today", title: t.title, due: t.due, catColor: color });
      } else if (t.due === tomorrow) {
        notifs.push({ id: t.id, taskId: t.id, type: "tomorrow", title: t.title, due: t.due, catColor: color });
      }
    });

    // Sort: overdue first, then today, then tomorrow
    return notifs.sort((a, b) => {
      const order = { overdue: 0, today: 1, tomorrow: 2 };
      return order[a.type] - order[b.type];
    });
  }, [tasks, categories, settings.accentColor, today, tomorrow]);

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const typeConfig = {
    overdue:  { icon: <AlertTriangle size={16} />, label: "Overdue", color: "#FF453A", bg: "#FF453A22" },
    today:    { icon: <Clock size={16} />,         label: "Due Today", color: "#FF9F0A", bg: "#FF9F0A22" },
    tomorrow: { icon: <CalendarClock size={16} />, label: "Due Tomorrow", color: "#0A84FF", bg: "#0A84FF22" },
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />

        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">🔔 Notifications</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: bgColAlt }}><X size={20} color={textCol} /></button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-bold text-lg mb-2">You&apos;re all caught up!</p>
            <p className="text-sm" style={{ color: "gray" }}>No overdue or upcoming deadlines.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const cfg = typeConfig[n.type];
              return (
                <div 
                  key={n.id}
                  onClick={() => { onOpenTask(n.taskId); onClose(); }}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition hover:opacity-80"
                  style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}33` }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{n.title}</p>
                    <p className="text-[11px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label} · 📅 {n.due}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: n.catColor }} />
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-center mt-6 opacity-40">
          Tasks due today, tomorrow, or overdue appear here automatically.
        </p>
      </div>
    </div>
  );
}
