"use client";
import { useState, useRef } from "react";
import { useStore, Task } from "@/store/useStore";
import { Check, Clock, GripVertical } from "lucide-react";

export function TaskCard({ task, onClick }: { task: Task, onClick: () => void }) {
  const { toggleTaskDone, categories, settings } = useStore();
  
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(0);

  const cat = categories.find(c => c.id === task.categoryId);
  const isOverdue = !task.done && task.due && new Date(task.due).getTime() < new Date().getTime();
  const subTotal = task.subtasks?.length || 0;
  const subDone = task.subtasks?.filter(s => s.done).length || 0;

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0 && !task.done) setOffset(Math.min(dx, 100));
  };
  const handleTouchEnd = () => {
    if (offset > 60 && !task.done) {
      setSwiped(true);
      setTimeout(() => {
        toggleTaskDone(task.id);
        setSwiped(false);
        setOffset(0);
      }, 300);
    } else {
      setOffset(0);
    }
  };

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#2C2C2E" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 shadow-sm border" style={{ borderColor: borderCol }}>
      {/* Swipe Background */}
      <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center bg-[#30D158] rounded-2xl">
        <Check size={24} color="#000" />
      </div>

      <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
        className="relative z-10 flex cursor-pointer transition-transform"
        style={{ 
          transform: `translateX(${swiped ? 100 : offset}px)`, 
          transition: offset === 0 ? "transform 0.25s ease" : "none",
          backgroundColor: bgCol,
          opacity: task.done ? 0.5 : 1
        }}
      >
        <div className="w-2 flex items-center justify-center" style={{ backgroundColor: cat?.color || settings.accentColor }}></div>
        
        <div className="p-4 flex-1 flex flex-col pl-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg leading-tight" style={{ color: textCol, textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.title}
            </h3>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTaskDone(task.id); }}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3"
              style={{ borderColor: task.done ? settings.accentColor : borderCol, backgroundColor: task.done ? settings.accentColor : 'transparent' }}
            >
              {task.done && <Check size={14} color="#000" strokeWidth={4} />}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2 mt-1">
            {task.priority === 'High' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">HIGH PRIORITY</span>}
            {task.recurrence !== 'none' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">🔁 {task.recurrence.toUpperCase()}</span>}
            {task.tags?.map(t => <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">#{t}</span>)}
          </div>

          {subTotal > 0 && (
            <div className="mt-2 mb-1">
              <div className="flex justify-between text-xs mb-1 font-medium" style={{ color: textSec }}>
                <span>Subtasks</span>
                <span>{subDone}/{subTotal}</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
                <div className="h-full transition-all" style={{ width: `${Math.round((subDone/subTotal)*100)}%`, backgroundColor: settings.accentColor }} />
              </div>
            </div>
          )}

          {task.due && (
            <div className="flex gap-1.5 items-center mt-2 text-xs font-semibold" style={{ color: isOverdue ? '#FF453A' : textSec }}>
              <Clock size={12} />
              <span>{task.due}</span>
              {isOverdue && <span className="ml-1 uppercase">Overdue</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
