"use client";
import { useState, useEffect } from "react";
import { useStore, Task, Subtask } from "@/store/useStore";
import { X, Check } from "lucide-react";

export function TaskModal({ taskId, onClose }: { taskId: number, onClose: () => void }) {
  const { tasks, categories, settings, updateTask, deleteTask } = useStore();
  const initialTask = tasks.find(t => t.id === taskId);

  if (!initialTask) return null;

  const [form, setForm] = useState<Task>(initialTask);
  const [newSub, setNewSub] = useState("");
  const [newTag, setNewTag] = useState("");

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const addSub = () => {
    if (!newSub.trim()) return;
    setForm(f => ({ ...f, subtasks: [...f.subtasks, { id: Date.now(), title: newSub.trim(), done: false }] }));
    setNewSub("");
  };
  const addTag = () => {
    if (!newTag.trim()) return;
    if (!form.tags.includes(newTag.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, newTag.trim().toLowerCase()] }));
    }
    setNewTag("");
  };

  const handleSave = () => {
    updateTask(taskId, form);
    onClose();
  };

  const inputStyle = { background: bgColAlt, border: `1px solid ${borderCol}`, color: textCol };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative"
        style={{ backgroundColor: bgCol, color: textCol }}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />
        
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">Edit Task</h2>
          <button onClick={onClose} className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition"><X size={20} color={textCol}/></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full p-4 rounded-xl outline-none font-medium" style={inputStyle} />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full p-4 rounded-xl outline-none resize-none" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value as any}))} className="w-full p-4 rounded-xl outline-none appearance-none" style={inputStyle}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: Number(e.target.value)}))} className="w-full p-4 rounded-xl outline-none appearance-none" style={inputStyle}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Due Date</label>
              <input type="date" value={form.due} onChange={e => setForm(f => ({...f, due: e.target.value}))} className="w-full p-4 rounded-xl outline-none" style={{ ...inputStyle, colorScheme: settings.darkMode ? 'dark' : 'light' }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Recurrence</label>
              <select value={form.recurrence} onChange={e => setForm(f => ({...f, recurrence: e.target.value as any}))} className="w-full p-4 rounded-xl outline-none appearance-none" style={inputStyle}>
                <option>none</option><option>daily</option><option>weekly</option><option>monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Subtasks ({form.subtasks.filter(s=>s.done).length}/{form.subtasks.length})</label>
            <div className="space-y-2 mb-3">
              {form.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: bgColAlt }}>
                  <button onClick={() => setForm(f => ({...f, subtasks: f.subtasks.map(sub => sub.id === s.id ? {...sub, done: !sub.done} : sub)}))}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: s.done ? settings.accentColor : borderCol, backgroundColor: s.done ? settings.accentColor : 'transparent' }}
                  >
                    {s.done && <Check size={14} color="#000" strokeWidth={4} />}
                  </button>
                  <span className={`flex-1 font-medium ${s.done ? 'line-through opacity-50' : ''}`}>{s.title}</span>
                  <button onClick={() => setForm(f => ({...f, subtasks: f.subtasks.filter(sub => sub.id !== s.id)}))} className="text-red-500 opacity-60 hover:opacity-100 p-1"><X size={16}/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} placeholder="Add a subtask..." className="flex-1 p-3 rounded-xl outline-none text-sm" style={inputStyle} />
              <button onClick={addSub} className="px-5 rounded-xl font-bold text-black border-none" style={{ backgroundColor: settings.accentColor }}>Add</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium flex gap-2 items-center" style={{ background: bgColAlt, border: `1px solid ${borderCol}` }}>
                  #{tag}
                  <button onClick={() => setForm(f => ({...f, tags: f.tags.filter(t => t !== tag)}))} className="opacity-60 hover:opacity-100"><X size={12}/></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag..." className="flex-1 p-3 rounded-xl outline-none text-sm" style={inputStyle} />
              <button onClick={addTag} className="px-5 rounded-xl font-bold text-black border-none" style={{ backgroundColor: settings.accentColor }}>Add</button>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button onClick={handleSave} className="w-full py-4 rounded-xl text-black font-extrabold text-lg shadow-lg hover:opacity-90 transition" style={{ backgroundColor: settings.accentColor }}>Save Changes</button>
            <button onClick={() => { deleteTask(taskId); onClose(); }} className="w-full py-3 rounded-xl font-bold text-[#FF453A] border-2 border-transparent hover:border-[#FF453A]/30 transition" style={{ backgroundColor: `${bgColAlt}` }}>Delete Task</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
