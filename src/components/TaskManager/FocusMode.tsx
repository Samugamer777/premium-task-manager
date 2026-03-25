"use client";
import { useStore } from "@/store/useStore";
import { i18n } from "@/lib/i18n";
import { X, Check } from "lucide-react";

export function FocusMode({ taskId, onClose }: { taskId: number, onClose: () => void }) {
  const { tasks, categories, settings, toggleTaskDone } = useStore();
  const t = i18n[settings.language] || i18n.en;
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return null;

  const bgCol = settings.darkMode ? "#000000" : "#F2F2F7";
  const bgColAlt = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";

  const cat = categories.find(c => c.id === task.categoryId);
  const subTotal = task.subtasks?.length || 0;
  const subDone = task.subtasks?.filter(s => s.done).length || 0;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-6" style={{ backgroundColor: bgCol, color: textCol }}>
      <button onClick={onClose} className="absolute top-12 right-6 px-6 py-3 rounded-full font-bold text-sm" style={{ backgroundColor: bgColAlt }}>
        {t.exitFocus}
      </button>

      <div className="text-center max-w-sm w-full">
        <div className="text-6xl mb-8 animate-bounce">🎯</div>
        <p className="text-sm uppercase tracking-widest font-bold mb-4" style={{ color: settings.accentColor }}>{t.focusOn}</p>
        
        <h2 className="text-3xl font-black mb-6 leading-tight">{task.title}</h2>
        {task.description && <p className="text-lg opacity-70 mb-8 leading-relaxed max-w-sm mx-auto">{task.description}</p>}

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: bgColAlt }}>{task.priority}</span>
          {cat && <span className="px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>{cat.name}</span>}
        </div>

        {subTotal > 0 && (
          <div className="w-full text-left rounded-3xl p-6 mb-10 shadow-xl" style={{ backgroundColor: bgColAlt }}>
            <h4 className="font-bold mb-4 opacity-50 flex justify-between uppercase text-xs">
              <span>{t.subtasks}</span>
              <span>{subDone} / {subTotal}</span>
            </h4>
            <div className="h-2 w-full rounded-full overflow-hidden mb-6" style={{ backgroundColor: borderCol }}>
              <div className="h-full transition-all" style={{ width: `${Math.round((subDone/subTotal)*100)}%`, backgroundColor: settings.accentColor }} />
            </div>
            
            <div className="space-y-3">
              {task.subtasks.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className={`font-medium ${s.done ? 'line-through opacity-30' : ''}`}>{s.title}</span>
                  {s.done && <Check size={18} color={settings.accentColor} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => { toggleTaskDone(task.id); onClose(); }}
          className="w-full py-5 rounded-2xl text-black font-black text-xl hover:scale-105 active:scale-95 transition-transform" 
          style={{ backgroundColor: settings.accentColor, boxShadow: `0 20px 40px ${settings.accentColor}44` }}
        >
          {task.done ? t.undoCompletion : t.markAsDone}
        </button>
      </div>
    </div>
  );
}
