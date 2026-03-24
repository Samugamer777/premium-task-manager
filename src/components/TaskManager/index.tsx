"use client";
import { useState, useMemo, useCallback } from "react";
import { useStore, TaskPriority, KanbanCol } from "@/store/useStore";
import { Header } from "./Header";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { SettingsModal } from "./SettingsModal";
import { PomodoroModal } from "./PomodoroModal";
import { FocusMode } from "./FocusMode";
import { CalendarView } from "./CalendarView";
import { FireConfetti } from "./Confetti";
import { KanbanView } from "./KanbanView";
import { Search, Plus, X, ChevronDown } from "lucide-react";

const PRIORITY_COLORS = {
  High:   { bg: "#FF453A22", text: "#FF453A", border: "#FF453A44" },
  Medium: { bg: "#FF9F0A22", text: "#FF9F0A", border: "#FF9F0A44" },
  Low:    { bg: "#30D15822", text: "#30D158", border: "#30D15844" },
};

interface NewTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  categoryId: number;
  due: string;
  kanban: KanbanCol;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  tags: string[];
}

export default function TaskManager() {
  const { tasks, categories, settings, addTask, toggleTaskDone, recordActivity } = useStore();
  
  const [view, setView] = useState<"list" | "kanban" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<number | "All">("All");
  
  const [showForm, setShowForm] = useState(false);
  const defaultForm: NewTaskForm = {
    title: "", description: "", priority: "Medium",
    categoryId: categories[0]?.id || 1, due: "", kanban: "To Do",
    recurrence: "none", tags: []
  };
  const [form, setForm] = useState<NewTaskForm>(defaultForm);
  const [newTag, setNewTag] = useState("");
  
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [focusTask, setFocusTask] = useState<number | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const trialStart = settings.trialStart;
  const isExpired = trialStart && (new Date().getTime() - new Date(trialStart).getTime()) / 86400000 > 3;

  const bgCol = settings.darkMode ? "#000000" : "#F2F2F7";
  const bgColAlt = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const inputBg = settings.darkMode ? "#2C2C2E" : "#F2F2F7";

  // When a task is completed, fire confetti
  const handleToggleDone = useCallback((id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
      setShowConfetti(true);
    }
    toggleTaskDone(id);
    recordActivity();
  }, [tasks, toggleTaskDone, recordActivity]);

  const handleAddTask = () => {
    if (!form.title.trim()) return;
    addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      categoryId: form.categoryId,
      due: form.due,
      blockedBy: [],
      subtasks: [],
      kanban: form.kanban,
      tags: form.tags,
      recurrence: form.recurrence,
    });
    setForm({ ...defaultForm, categoryId: categories[0]?.id || 1 });
    setNewTag("");
    setShowForm(false);
    recordActivity();
  };

  const addFormTag = () => {
    if (!newTag.trim()) return;
    if (!form.tags.includes(newTag.trim().toLowerCase())) {
      setForm(f => ({ ...f, tags: [...f.tags, newTag.trim().toLowerCase()] }));
    }
    setNewTag("");
  };

  const sortedTasks = useMemo(() => {
    let base = tasks.filter(t => 
      (filterCat === "All" || t.categoryId === filterCat) &&
      (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    );
    return [...base].sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Done last
      if (a.done !== b.done) return a.done ? 1 : -1;
      // Priority
      const scores = { High: 0, Medium: 1, Low: 2 };
      const ps = scores[a.priority] - scores[b.priority];
      if (ps !== 0) return ps;
      // Due date
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return 0;
    });
  }, [tasks, filterCat, search]);

  const topUrgent = tasks.filter(t => !t.done).sort((a, b) => {
    const scores = { High: 0, Medium: 1, Low: 2 };
    return scores[a.priority] - scores[b.priority];
  })[0];

  const viewLabels = { list: "☰ List", kanban: "⬜ Kanban", calendar: "📅 Calendar" };

  if (isExpired && !settings.licenseKey) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-extrabold mb-4">Trial Expired 😓</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md">Your 3-day free trial has ended. Subscribe to Pro to continue.</p>
        <button onClick={() => window.location.href="/checkout"} className="px-8 py-4 bg-[#30D158] text-black font-bold rounded-xl mb-4 text-lg">Subscribe for $1 / month</button>
        <button onClick={() => window.location.href="/login"} className="px-8 py-4 bg-gray-900 text-white rounded-xl">I already have a License Key</button>
      </div>
    );
  }

  const selectedCat = categories.find(c => c.id === form.categoryId);

  return (
    <div className="min-h-screen font-sans pb-24 selection:bg-[#30D158]/30 max-w-[600px] mx-auto overflow-hidden shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
      {showConfetti && <FireConfetti onDone={() => setShowConfetti(false)} />}
      
      <Header onOpenSettings={() => setShowSettings(true)} />

      {/* Quick Action Bar */}
      <div className="px-6 flex gap-3 mb-6">
        <button onClick={() => setShowPomodoro(true)} className="flex-1 py-3 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition hover:opacity-80" style={{ borderColor: borderCol, backgroundColor: bgColAlt }}>
          ⏱ Timer
        </button>
        {topUrgent && (
          <button onClick={() => setFocusTask(topUrgent.id)} className="flex-[2] px-6 py-3 h-14 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition text-black" style={{ backgroundColor: settings.accentColor }}>
            🎯 Focus Mode
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 opacity-40" size={18} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." 
            className="w-full py-4 pl-12 pr-4 rounded-2xl outline-none font-medium text-sm transition"
            style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}`, color: textCol }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          <button 
            onClick={() => setFilterCat("All")}
            className="px-5 py-2 rounded-full font-bold text-sm shrink-0 transition"
            style={{ backgroundColor: filterCat === "All" ? settings.accentColor : bgColAlt, color: filterCat === "All" ? '#000' : textCol }}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? "All" : cat.id)}
              className="px-5 py-2 rounded-full font-bold text-sm shrink-0 flex items-center gap-2 transition"
              style={{ 
                backgroundColor: filterCat === cat.id ? `${cat.color}22` : bgColAlt, 
                color: filterCat === cat.id ? cat.color : textCol,
                border: filterCat === cat.id ? `1px solid ${cat.color}44` : `1px solid transparent`
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-6 mb-4 flex gap-2">
        {(["list", "kanban", "calendar"] as const).map(v => (
          <button 
            key={v} onClick={() => setView(v)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition"
            style={{ 
              backgroundColor: view === v ? bgColAlt : "transparent", 
              color: view === v ? settings.accentColor : 'gray',
              border: `2px solid ${view === v ? borderCol : 'transparent'}`
            }}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {/* Views */}
      <div className="px-6 relative">
        {view === "list" && (
          <div className="pb-8">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task.id)} onToggle={handleToggleDone} />
            ))}
            {sortedTasks.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-medium">
                {search ? "No tasks found." : "No tasks here yet 🎉"}
              </div>
            )}
            
            {/* ─── RICH ADD TASK FORM ─── */}
            {showForm ? (
              <div className="mt-4 rounded-3xl overflow-hidden shadow-xl" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
                {/* Header */}
                <div className="flex justify-between items-center p-5 pb-0">
                  <h3 className="font-extrabold text-lg">New Task</h3>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Title *</label>
                    <input 
                      autoFocus
                      value={form.title} 
                      onChange={e => setForm(f => ({...f, title: e.target.value}))} 
                      onKeyDown={e => e.key === 'Enter' && form.title.trim() && handleAddTask()}
                      placeholder="What needs to be done?" 
                      className="w-full p-4 rounded-xl outline-none font-bold text-base"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Description</label>
                    <textarea 
                      value={form.description} 
                      onChange={e => setForm(f => ({...f, description: e.target.value}))}
                      placeholder="Notes, links, context..."
                      rows={2}
                      className="w-full p-4 rounded-xl outline-none text-sm resize-none"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest mb-2 block" style={{ color: textSec }}>Priority</label>
                    <div className="flex gap-2">
                      {(["High", "Medium", "Low"] as TaskPriority[]).map(p => {
                        const pc = PRIORITY_COLORS[p];
                        const active = form.priority === p;
                        return (
                          <button 
                            key={p} 
                            onClick={() => setForm(f => ({...f, priority: p}))}
                            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                            style={{ 
                              backgroundColor: active ? pc.bg : inputBg,
                              color: active ? pc.text : textSec,
                              border: `2px solid ${active ? pc.border : 'transparent'}`,
                            }}
                          >
                            {p === "High" ? "🔴" : p === "Medium" ? "🟡" : "🟢"} {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category & Kanban Column (side by side) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Category</label>
                      <select 
                        value={form.categoryId} 
                        onChange={e => setForm(f => ({...f, categoryId: Number(e.target.value)}))}
                        className="w-full p-3 rounded-xl outline-none font-semibold text-sm appearance-none"
                        style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Status</label>
                      <select 
                        value={form.kanban}
                        onChange={e => setForm(f => ({...f, kanban: e.target.value as KanbanCol}))}
                        className="w-full p-3 rounded-xl outline-none font-semibold text-sm appearance-none"
                        style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>

                  {/* Due Date & Recurrence (side by side) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Due Date</label>
                      <input 
                        type="date" 
                        value={form.due} 
                        onChange={e => setForm(f => ({...f, due: e.target.value}))}
                        className="w-full p-3 rounded-xl outline-none font-semibold text-sm"
                        style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol, colorScheme: settings.darkMode ? 'dark' : 'light' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Repeat</label>
                      <select 
                        value={form.recurrence}
                        onChange={e => setForm(f => ({...f, recurrence: e.target.value as any}))}
                        className="w-full p-3 rounded-xl outline-none font-semibold text-sm appearance-none"
                        style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                      >
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 block" style={{ color: textSec }}>Tags</label>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold flex gap-1.5 items-center" style={{ backgroundColor: inputBg, color: settings.accentColor }}>
                            #{tag}
                            <button onClick={() => setForm(f => ({...f, tags: f.tags.filter(t => t !== tag)}))} className="opacity-60 hover:opacity-100"><X size={10}/></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input 
                        value={newTag} 
                        onChange={e => setNewTag(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFormTag())}
                        placeholder="#tag" 
                        className="flex-1 p-3 rounded-xl outline-none text-sm"
                        style={{ backgroundColor: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                      />
                      <button onClick={addFormTag} className="px-4 rounded-xl font-bold text-sm text-black" style={{ backgroundColor: settings.accentColor }}>+</button>
                    </div>
                  </div>

                  {/* Preview chip */}
                  {form.title.trim() && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold flex-wrap" style={{ backgroundColor: `${settings.accentColor}11`, border: `1px dashed ${settings.accentColor}44` }}>
                      <span style={{ color: settings.accentColor }}>Preview:</span>
                      <span>{form.title}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[form.priority].bg, color: PRIORITY_COLORS[form.priority].text }}>{form.priority}</span>
                      {selectedCat && <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedCat.color}22`, color: selectedCat.color }}>{selectedCat.name}</span>}
                      <span className="opacity-50">{form.kanban}</span>
                      {form.due && <span className="opacity-50">📅 {form.due}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => { setShowForm(false); setForm({...defaultForm, categoryId: categories[0]?.id || 1}); }}
                      className="flex-1 py-4 rounded-xl font-bold text-sm transition hover:opacity-80"
                      style={{ backgroundColor: inputBg, color: textCol }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddTask}
                      className="flex-[2] py-4 rounded-xl font-extrabold text-base text-black transition hover:opacity-90 disabled:opacity-30"
                      style={{ backgroundColor: settings.accentColor }}
                      disabled={!form.title.trim()}
                    >
                      Create Task
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowForm(true)}
                className="w-full mt-4 py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition hover:opacity-80"
                style={{ borderColor: borderCol, color: textSec }}
              >
                <Plus size={24} />
                <span className="font-bold text-sm tracking-widest uppercase">Add New Task</span>
              </button>
            )}
          </div>
        )}
        
        {view === "kanban" && <KanbanView onOpenTask={setSelectedTask} />}
        {view === "calendar" && <CalendarView onOpenTask={setSelectedTask} />}
      </div>

      {/* Floating Add Button for non-list views */}
      {!showForm && view !== "list" && (
        <button 
          onClick={() => { setView("list"); setShowForm(true); }} 
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl text-black transition-transform hover:scale-110 active:scale-90 z-50" 
          style={{ backgroundColor: settings.accentColor, boxShadow: `0 10px 30px ${settings.accentColor}55` }}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      {/* Modals */}
      {selectedTask && <TaskModal taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showPomodoro && <PomodoroModal onClose={() => setShowPomodoro(false)} />}
      {focusTask && <FocusMode taskId={focusTask} onClose={() => setFocusTask(null)} />}
    </div>
  );
}
