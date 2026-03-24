"use client";
import { useState, useRef } from "react";
import { useStore, Task } from "@/store/useStore";
import { Check, Clock, Pin } from "lucide-react";

const PRIORITY_BADGE = {
  High:   { emoji: "🔴", bg: "#FF453A22", text: "#FF453A" },
  Medium: { emoji: "🟡", bg: "#FF9F0A22", text: "#FF9F0A" },
  Low:    { emoji: "🟢", bg: "#30D15822", text: "#30D158" },
};

export function TaskCard({ task, onClick, onToggle }: { task: Task, onClick: () => void, onToggle?: (id: number) => void }) {
  const { toggleTaskDone, categories, settings, updateTask } = useStore();
  
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(0);

  const cat = categories.find(c => c.id === task.categoryId);
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = !task.done && task.due && task.due < today;
  const subTotal = task.subtasks?.length || 0;
  const subDone = task.subtasks?.filter(s => s.done).length || 0;

  const doToggle = () => {
    if (onToggle) onToggle(task.id);
    else toggleTaskDone(task.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0 && !task.done) setOffset(Math.min(dx, 100));
  };
  const handleTouchEnd = () => {
    if (offset > 60 && !task.done) {
      setSwiped(true);
      setTimeout(() => { doToggle(); setSwiped(false); setOffset(0); }, 300);
    } else {
      setOffset(0);
    }
  };

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#2C2C2E" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const pb = PRIORITY_BADGE[task.priority];
  const kanbanLabel = task.kanban === "In Progress" ? "In Progress" : task.kanban === "Done" ? "Done" : "";

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 shadow-sm" style={{ border: `1px solid ${borderCol}` }}>
      {/* Swipe green background */}
      <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center rounded-2xl" style={{ backgroundColor: settings.accentColor }}>
        <Check size={24} color="#000" />
      </div>

      <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
        className="relative z-10 flex cursor-pointer"
        style={{ 
          transform: `translateX(${swiped ? 100 : offset}px)`, 
          transition: offset === 0 ? "transform 0.25s ease" : "none",
          backgroundColor: bgCol,
          opacity: task.done ? 0.45 : 1
        }}
      >
        {/* Left color strip */}
        <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ backgroundColor: cat?.color || settings.accentColor }} />
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {task.pinned && <Pin size={14} className="shrink-0" style={{ color: settings.accentColor }} />}
              <h3 className="font-bold text-[15px] leading-tight truncate" style={{ color: textCol, textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.title}
              </h3>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); doToggle(); }}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{ borderColor: task.done ? settings.accentColor : borderCol, backgroundColor: task.done ? settings.accentColor : 'transparent' }}
            >
              {task.done && <Check size={12} color="#000" strokeWidth={4} />}
            </button>
          </div>

          {task.description && (
            <p className="text-xs mb-2 line-clamp-1" style={{ color: textSec }}>{task.description}</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {/* Priority */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: pb.bg, color: pb.text }}>
              {pb.emoji} {task.priority}
            </span>
            {/* Category */}
            {cat && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                {cat.name}
              </span>
            )}
            {/* Kanban status if not "To Do" */}
            {kanbanLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: settings.darkMode ? '#2C2C2E' : '#E5E5EA', color: textSec }}>
                {kanbanLabel}
              </span>
            )}
            {/* Recurrence */}
            {task.recurrence !== 'none' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                🔁 {task.recurrence}
              </span>
            )}
            {/* Tags */}
            {task.tags?.map(t => (
              <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: settings.darkMode ? '#2C2C2E' : '#E5E5EA', color: textSec }}>
                #{t}
              </span>
            ))}
          </div>

          {/* Subtasks progress */}
          {subTotal > 0 && (
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] mb-1 font-bold uppercase tracking-wider" style={{ color: textSec }}>
                <span>Subtasks</span>
                <span>{subDone}/{subTotal}</span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
                <div className="h-full transition-all" style={{ width: `${Math.round((subDone/subTotal)*100)}%`, backgroundColor: settings.accentColor }} />
              </div>
            </div>
          )}

          {/* Due date */}
          {task.due && (
            <div className="flex gap-1.5 items-center mt-2.5 text-[11px] font-bold" style={{ color: isOverdue ? '#FF453A' : textSec }}>
              <Clock size={11} />
              <span>📅 {task.due}</span>
              {isOverdue && <span className="ml-1 uppercase text-[10px]">⚠ Overdue</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
