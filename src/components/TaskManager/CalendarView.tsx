"use client";
import { useState, useMemo } from "react";
import { useStore, Task } from "@/store/useStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CalendarView({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { tasks, categories, settings } = useStore();
  
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];
  
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthNamesEs = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const mName = settings.language === 'es' ? monthNamesEs[month] : monthNames[month];
  const dayLabels = settings.language === 'es' ? ["Do","Lu","Ma","Mi","Ju","Vi","Sá"] : ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.due) {
        if (!map[t.due]) map[t.due] = [];
        map[t.due].push(t);
      }
    });
    return map;
  }, [tasks]);

  const cells: (number | null)[] = Array.from({ length: firstDay }, () => null as number | null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}` : null;
  const selectedTasks = selectedDateStr ? (tasksByDate[selectedDateStr] || []) : [];

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-6 px-2">
        <button onClick={() => { setCurrent(new Date(year, month - 1, 1)); setSelectedDay(null); }} className="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: bgColAlt }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">{mName} {year}</h2>
        <button onClick={() => { setCurrent(new Date(year, month + 1, 1)); setSelectedDay(null); }} className="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: bgColAlt }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = selectedDay === d;
          
          return (
            <div 
              key={d} 
              onClick={() => setSelectedDay(isSelected ? null : d)}
              className="h-14 rounded-[14px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border-2"
              style={{ 
                backgroundColor: isSelected ? settings.accentColor : bgCol,
                borderColor: isSelected ? settings.accentColor : isToday ? settings.accentColor : 'transparent',
                color: isSelected ? '#000' : textCol,
                boxShadow: settings.darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <span className={`text-sm ${isToday || isSelected ? 'font-bold' : 'font-medium'}`}>{d}</span>
              {dayTasks.length > 0 && (
                <div className="flex gap-1">
                  {dayTasks.slice(0,3).map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    return <div key={t.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? '#000' : cat?.color || settings.accentColor }} />
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="rounded-3xl p-6 shadow-xl border" style={{ backgroundColor: bgCol, borderColor: borderCol }}>
          <h3 className="text-lg font-bold mb-4">{mName} {selectedDay}</h3>
          
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No tasks for this day 🎉</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedTasks.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} onClick={() => onOpenTask(t.id)} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:opacity-80 transition" style={{ backgroundColor: bgColAlt }}>
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.done ? 'gray' : cat?.color || settings.accentColor }} />
                    <span className={`font-semibold flex-1 ${t.done ? 'line-through opacity-50' : ''}`}>{t.title}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
