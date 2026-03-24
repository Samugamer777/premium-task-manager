"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Header } from "./Header";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { SettingsModal } from "./SettingsModal";
import { PomodoroModal } from "./PomodoroModal";
import { FocusMode } from "./FocusMode";
import { CalendarView } from "./CalendarView";
// import { KanbanView } from "./KanbanView"; // We skip full dnd in main to avoid hydration mismatch if needed, but let's include it
import { FireConfetti } from "./Confetti";
import { KanbanView } from "./KanbanView";
import { Search, Plus } from "lucide-react";

export default function TaskManager() {
  const { tasks, categories, settings, addTask } = useStore();
  
  const [view, setView] = useState<"list" | "kanban" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<number | "All">("All");
  
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [focusTask, setFocusTask] = useState<number | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trial Logic
  const trialStart = settings.trialStart;
  const isExpired = trialStart && (new Date().getTime() - new Date(trialStart).getTime()) / 86400000 > 3;

  const bgCol = settings.darkMode ? "#000000" : "#F2F2F7";
  const bgColAlt = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const handleAddTask = () => {
    if (!formTitle.trim()) return;
    addTask({
      title: formTitle.trim(),
      description: "",
      priority: "Medium",
      categoryId: categories[0]?.id || 1,
      due: "",
      blockedBy: [],
      subtasks: [],
      kanban: "To Do",
      tags: [],
      recurrence: "none"
    });
    setFormTitle("");
    setShowForm(false);
  };

  const sortedTasks = useMemo(() => {
    let base = tasks.filter(t => 
      (filterCat === "All" || t.categoryId === filterCat) &&
      (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    );
    // Sort logic: incomplete first, high priority first
    return base.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const scores = { High: 0, Medium: 1, Low: 2 };
      return scores[a.priority] - scores[b.priority];
    });
  }, [tasks, filterCat, search]);

  const topUrgent = tasks.filter(t => !t.done).sort((a, b) => {
    const scores = { High: 0, Medium: 1, Low: 2 };
    return scores[a.priority] - scores[b.priority];
  })[0];

  if (isExpired && !settings.licenseKey) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-extrabold mb-4">Trial Expired 😓</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md">Your 3-day free trial has ended. Please subscribe to Pro to continue using FocusTask.</p>
        <button onClick={() => window.location.href="/checkout"} className="px-8 py-4 bg-[#30D158] text-black font-bold rounded-xl mb-4 text-lg">Subscribe for $1 / month</button>
        <button onClick={() => window.location.href="/login"} className="px-8 py-4 bg-gray-900 text-white rounded-xl">I already have a License Key</button>
      </div>
    );
  }

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
          <button onClick={() => setFocusTask(topUrgent.id)} className="flex-2 px-6 py-3 h-14 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition text-black" style={{ backgroundColor: settings.accentColor }}>
            🎯 Focus Mode
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="px-6 mb-6">
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 opacity-40" size={18} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions..." 
            className="w-full py-4 pl-12 pr-4 rounded-2xl outline-none font-medium text-sm transition"
            style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}`, color: textCol }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          <button 
            onClick={() => setFilterCat("All")}
            className="px-5 py-2 rounded-full font-bold text-sm shrink-0 snap-start transition"
            style={{ backgroundColor: filterCat === "All" ? settings.accentColor : bgColAlt, color: filterCat === "All" ? '#000' : textCol }}
          >
            All Tasks
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} onClick={() => setFilterCat(cat.id)}
              className="px-5 py-2 rounded-full font-bold text-sm shrink-0 snap-start flex items-center gap-2 transition"
              style={{ backgroundColor: filterCat === cat.id ? `${cat.color}22` : bgColAlt, color: filterCat === cat.id ? cat.color : textCol, border: filterCat === cat.id ? `1px solid ${cat.color}44` : `1px solid transparent` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filterCat === cat.id ? cat.color : 'transparent' }} />
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
            style={{ backgroundColor: view === v ? bgColAlt : "transparent", color: view === v ? settings.accentColor : 'gray', border: `2px solid ${view === v ? borderCol : 'transparent'}` }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Views Container */}
      <div className="px-6 relative">
        {view === "list" && (
          <div className="space-y-3 pb-8">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task.id)} />
            ))}
            {sortedTasks.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-medium">
                {search ? "No tasks found." : "No tasks here yet. Enjoy your day!"}
              </div>
            )}
            
            {showForm ? (
               <div className="p-4 rounded-2xl mt-4" style={{ backgroundColor: bgColAlt, border: `1px solid ${borderCol}` }}>
                <input 
                  autoFocus
                  value={formTitle} onChange={e => setFormTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="Task title..." 
                  className="w-full p-2 bg-transparent outline-none font-bold mb-3" style={{ color: textCol }}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ color: textCol }}>Cancel</button>
                  <button onClick={handleAddTask} className="px-6 py-2 rounded-xl text-black font-bold text-sm" style={{ backgroundColor: settings.accentColor }}>Save</button>
                </div>
               </div>
            ) : (
              <button 
                onClick={() => setShowForm(true)}
                className="w-full mt-4 py-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white transition"
                style={{ borderColor: borderCol }}
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

      {/* Floating Add Button for Mobile */}
      {!showForm && view !== "list" && (
        <button onClick={() => { setView("list"); setShowForm(true); }} className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl text-black transition-transform hover:scale-110 active:scale-90" style={{ backgroundColor: settings.accentColor, boxShadow: `0 10px 30px ${settings.accentColor}55` }}>
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
