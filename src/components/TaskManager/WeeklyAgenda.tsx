"use client";
import { useMemo } from "react";
import { useStore, Task } from "@/store/useStore";

export function WeeklyAgenda({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { tasks, categories, settings } = useStore();

  const bgColAlt = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#2C2C2E" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const inputBg = settings.darkMode ? "#2C2C2E" : "#F2F2F7";

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString(settings.language === "es" ? "es" : "en", { weekday: "long" });
      const dayNum = d.getDate();
      const isToday = dateStr === today.toISOString().split("T")[0];
      const dayTasks = tasks.filter(t => t.due === dateStr);

      days.push({ dateStr, dayName, dayNum, isToday, tasks: dayTasks });
    }
    return days;
  }, [tasks, settings.language]);

  return (
    <div className="space-y-4 pt-2">
      {weekDays.map(day => (
        <div key={day.dateStr} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${day.isToday ? settings.accentColor : borderCol}`, backgroundColor: bgColAlt }}>
          {/* Day Header */}
          <div className="flex items-center gap-3 p-4 pb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
              style={{ backgroundColor: day.isToday ? settings.accentColor : inputBg, color: day.isToday ? "#000" : textCol }}
            >
              {day.dayNum}
            </div>
            <div>
              <p className="text-sm font-bold capitalize" style={{ color: day.isToday ? settings.accentColor : textCol }}>{day.dayName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textSec }}>
                {day.tasks.length} {day.tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>

          {/* Tasks for this day */}
          {day.tasks.length > 0 ? (
            <div className="px-4 pb-3 space-y-2">
              {day.tasks.map(task => {
                const cat = categories.find(c => c.id === task.categoryId);
                return (
                  <button
                    key={task.id}
                    onClick={() => onOpenTask(task.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition hover:opacity-80"
                    style={{ backgroundColor: inputBg }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: task.done ? "gray" : cat?.color || settings.accentColor }} />
                    <span className={`flex-1 text-sm font-semibold truncate ${task.done ? "line-through opacity-40" : ""}`}>{task.title}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                      backgroundColor: task.priority === "High" ? "#FF453A22" : task.priority === "Medium" ? "#FF9F0A22" : "#30D15822",
                      color: task.priority === "High" ? "#FF453A" : task.priority === "Medium" ? "#FF9F0A" : "#30D158",
                    }}>{task.priority}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-4 pb-3 text-xs font-medium" style={{ color: textSec }}>No tasks scheduled</p>
          )}
        </div>
      ))}
    </div>
  );
}
