"use client";
import { useMemo } from "react";
import { useStore } from "@/store/useStore";

export function StatsView() {
  const { tasks, categories, settings, stats } = useStore();

  const today = new Date();
  const bgColAlt = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#2C2C2E" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";

  // Last 7 days data
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString(settings.language === "es" ? "es" : "en", { weekday: "short" });
      days.push({ date: dateStr, label: dayName, count: stats.completedHistory[dateStr] || 0 });
    }
    return days;
  }, [stats.completedHistory, settings.language]);

  const maxWeek = Math.max(...weekData.map(d => d.count), 1);
  const totalDone = tasks.filter(t => t.done).length;
  const totalPending = tasks.filter(t => !t.done).length;
  const totalSubs = tasks.reduce((s, t) => s + t.subtasks.length, 0);
  const totalSubsDone = tasks.reduce((s, t) => s + t.subtasks.filter(sub => sub.done).length, 0);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    return categories.map(cat => {
      const catTasks = tasks.filter(t => t.categoryId === cat.id);
      const done = catTasks.filter(t => t.done).length;
      return { ...cat, total: catTasks.length, done };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  }, [tasks, categories]);

  // Weekly goal
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStr = weekStart.toISOString().split("T")[0];
  const weeklyDone = Object.entries(stats.completedHistory)
    .filter(([date]) => date >= weekStr)
    .reduce((sum, [, count]) => sum + count, 0);
  const goalPct = Math.min(Math.round((weeklyDone / (settings.weeklyGoal || 1)) * 100), 100);

  return (
    <div className="space-y-6 pt-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Done", value: totalDone, color: settings.accentColor },
          { label: "Pending", value: totalPending, color: "#FF9F0A" },
          { label: "Streak", value: `${stats.streak}🔥`, color: "#FF453A" },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-2xl text-center" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
            <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: textSec }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Goal */}
      <div className="p-5 rounded-2xl" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold">🏅 Weekly Goal</h3>
          <span className="text-sm font-black" style={{ color: goalPct >= 100 ? settings.accentColor : textCol }}>{weeklyDone}/{settings.weeklyGoal}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${goalPct}%`, backgroundColor: goalPct >= 100 ? settings.accentColor : "#0A84FF" }} />
        </div>
        {goalPct >= 100 && <p className="text-xs text-center mt-2 font-bold" style={{ color: settings.accentColor }}>🎉 Goal reached! Amazing work!</p>}
      </div>

      {/* Weekly Bar Chart */}
      <div className="p-5 rounded-2xl" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
        <h3 className="text-sm font-bold mb-4">📊 Last 7 Days</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekData.map(d => {
            const h = d.count > 0 ? Math.max((d.count / maxWeek) * 100, 12) : 4;
            const isToday = d.date === today.toISOString().split("T")[0];
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: d.count > 0 ? settings.accentColor : textSec }}>{d.count || ""}</span>
                <div className="w-full rounded-lg transition-all" style={{ height: `${h}%`, backgroundColor: isToday ? settings.accentColor : d.count > 0 ? `${settings.accentColor}66` : borderCol }} />
                <span className="text-[9px] font-bold uppercase" style={{ color: isToday ? settings.accentColor : textSec }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtask Stats */}
      {totalSubs > 0 && (
        <div className="p-5 rounded-2xl" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">📎 Subtask Progress</h3>
            <span className="text-sm font-black" style={{ color: settings.accentColor }}>{totalSubsDone}/{totalSubs}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
            <div className="h-full transition-all" style={{ width: `${Math.round((totalSubsDone/totalSubs)*100)}%`, backgroundColor: settings.accentColor }} />
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="p-5 rounded-2xl" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
        <h3 className="text-sm font-bold mb-4">🗂 By Category</h3>
        <div className="space-y-3">
          {catBreakdown.map(cat => {
            const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-bold">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: textSec }}>{cat.done}/{cat.total} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
                  <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
          {catBreakdown.length === 0 && <p className="text-xs text-center py-4" style={{ color: textSec }}>No tasks yet</p>}
        </div>
      </div>
    </div>
  );
}
