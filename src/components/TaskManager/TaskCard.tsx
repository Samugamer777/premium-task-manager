"use client";
import { useState, useRef } from "react";
import { useStore, Task } from "@/store/useStore";
import { Check, Clock, Pin, Trash2, ChevronDown, ChevronUp, Play } from "lucide-react";

const PRIORITY_BADGE = {
  High:   { emoji: "🔴", bg: "#FF453A22", text: "#FF453A" },
  Medium: { emoji: "🟡", bg: "#FF9F0A22", text: "#FF9F0A" },
  Low:    { emoji: "🟢", bg: "#30D15822", text: "#30D158" },
};

const KANBAN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  "To Do":       { label: "To Do",       color: "#8E8E93", bg: "#8E8E9322" },
  "In Progress": { label: "In Progress", color: "#0A84FF", bg: "#0A84FF22" },
  "Done":        { label: "Done",        color: "#30D158", bg: "#30D15822" },
};

export function TaskCard({ task, onClick, onToggle }: { task: Task; onClick: () => void; onToggle?: (id: number) => void }) {
  const { toggleTaskDone, deleteTask, categories, settings, updateTask, moveTask } = useStore();

  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState<"none" | "right" | "left">("none");
  const [showSubs, setShowSubs] = useState(false);
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

  // Toggle subtask inline and auto-move to "In Progress" if task was "To Do"
  const toggleSub = (subId: number) => {
    const newSubs = task.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s);
    const newDoneCount = newSubs.filter(s => s.done).length;
    
    const updates: Partial<Task> = { subtasks: newSubs };
    
    // Auto-transition: if any subtask is done and task is "To Do", move to "In Progress"
    if (newDoneCount > 0 && newDoneCount < newSubs.length && (task.kanban === "To Do")) {
      updates.kanban = "In Progress";
    }
    // Auto-transition: if ALL subtasks done, move to "Done" and mark task done
    if (newDoneCount === newSubs.length && newSubs.length > 0) {
      updates.kanban = "Done";
      updates.done = true;
    }
    // If unchecking and all were done before, revert to "In Progress"
    if (newDoneCount < newSubs.length && task.done) {
      updates.kanban = "In Progress";
      updates.done = false;
    }

    updateTask(task.id, updates);
  };

  // Swipe logic: right = done, left = in progress
  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx > 0 && !task.done) setOffsetX(Math.min(dx, 100)); // swipe right
    if (dx < 0 && !task.done && task.kanban !== "In Progress") setOffsetX(Math.max(dx, -100)); // swipe left
  };
  const handleTouchEnd = () => {
    if (offsetX > 60 && !task.done) {
      // Swipe right → Done
      setSwiped("right");
      setTimeout(() => { doToggle(); setSwiped("none"); setOffsetX(0); }, 300);
    } else if (offsetX < -60 && !task.done && task.kanban !== "In Progress") {
      // Swipe left → In Progress
      setSwiped("left");
      setTimeout(() => { moveTask(task.id, "In Progress"); setSwiped("none"); setOffsetX(0); }, 300);
    } else {
      setOffsetX(0);
    }
  };

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#2C2C2E" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const inputBg = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const pb = PRIORITY_BADGE[task.priority];
  const kb = KANBAN_BADGE[task.kanban || "To Do"];

  const swipeTransform = swiped === "right" ? 120 : swiped === "left" ? -120 : offsetX;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 shadow-sm" style={{ border: `1px solid ${borderCol}` }}>
      {/* Swipe Right Background (Done - green) */}
      <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center" style={{ backgroundColor: settings.accentColor }}>
        <Check size={22} color="#000" strokeWidth={3} />
      </div>
      {/* Swipe Left Background (In Progress - blue) */}
      <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center" style={{ backgroundColor: "#0A84FF" }}>
        <Play size={18} color="#fff" fill="#fff" />
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
        className="relative z-10 flex cursor-pointer"
        style={{
          transform: `translateX(${swipeTransform}px)`,
          transition: offsetX === 0 ? "transform 0.25s ease" : "none",
          backgroundColor: bgCol,
          opacity: task.done ? 0.45 : 1,
        }}
      >
        {/* Left color strip */}
        <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ backgroundColor: cat?.color || settings.accentColor }} />

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {task.pinned && <Pin size={14} className="shrink-0" style={{ color: settings.accentColor }} />}
              <h3 className="font-bold text-[15px] leading-tight truncate" style={{ color: textCol, textDecoration: task.done ? "line-through" : "none" }}>
                {task.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick "In Progress" button (visible for To Do tasks) */}
              {!task.done && task.kanban === "To Do" && (
                <button
                  onClick={e => { e.stopPropagation(); moveTask(task.id, "In Progress"); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "#0A84FF22", color: "#0A84FF" }}
                  title="Start task"
                >
                  <Play size={12} fill="currentColor" />
                </button>
              )}
              {task.done && (
                <button
                  onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20"
                  style={{ color: "#FF453A" }}
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); doToggle(); }}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                style={{ borderColor: task.done ? settings.accentColor : borderCol, backgroundColor: task.done ? settings.accentColor : "transparent" }}
              >
                {task.done && <Check size={12} color="#000" strokeWidth={4} />}
              </button>
            </div>
          </div>

          {task.description && <p className="text-xs mb-2 line-clamp-1" style={{ color: textSec }}>{task.description}</p>}

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: pb.bg, color: pb.text }}>
              {pb.emoji} {task.priority}
            </span>
            {cat && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                {cat.name}
              </span>
            )}
            {/* Always show kanban status */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: kb.bg, color: kb.color }}>
              {kb.label}
            </span>
            {task.recurrence !== "none" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">🔁 {task.recurrence}</span>
            )}
            {task.tags?.map(t => (
              <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: inputBg, color: textSec }}>
                #{t}
              </span>
            ))}
          </div>

          {/* Subtasks progress — tappable to expand inline checklist */}
          {subTotal > 0 && (
            <div className="mt-2.5">
              <button
                onClick={e => { e.stopPropagation(); setShowSubs(!showSubs); }}
                className="w-full flex justify-between items-center text-[10px] mb-1 font-bold uppercase tracking-wider"
                style={{ color: textSec }}
              >
                <span>Subtasks</span>
                <span className="flex items-center gap-1">
                  {subDone}/{subTotal}
                  {showSubs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </span>
              </button>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: borderCol }}>
                <div className="h-full transition-all" style={{ width: `${Math.round((subDone / subTotal) * 100)}%`, backgroundColor: settings.accentColor }} />
              </div>

              {/* Inline subtask checklist */}
              {showSubs && (
                <div className="mt-2 space-y-1.5">
                  {task.subtasks.map(sub => (
                    <button
                      key={sub.id}
                      onClick={e => { e.stopPropagation(); toggleSub(sub.id); }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition hover:opacity-80"
                      style={{ backgroundColor: inputBg }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor: sub.done ? settings.accentColor : borderCol, backgroundColor: sub.done ? settings.accentColor : "transparent" }}
                      >
                        {sub.done && <Check size={8} color="#000" strokeWidth={4} />}
                      </div>
                      <span className={`text-xs font-medium flex-1 ${sub.done ? "line-through opacity-40" : ""}`}>{sub.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Due date */}
          {task.due && (
            <div className="flex gap-1.5 items-center mt-2.5 text-[11px] font-bold" style={{ color: isOverdue ? "#FF453A" : textSec }}>
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
