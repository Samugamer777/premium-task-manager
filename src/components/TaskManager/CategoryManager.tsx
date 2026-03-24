"use client";
import { useState } from "react";
import { useStore, Category } from "@/store/useStore";
import { X, Plus, Pencil, Check, Trash2 } from "lucide-react";

const PALETTE = ["#7B8FFF","#C77BFF","#4DD9D9","#FF8C5A","#FF6B6B","#FFB347","#6FCF6F","#FF375F","#0A84FF","#FFD60A"];

export function CategoryManager({ onClose }: { onClose: () => void }) {
  const { categories, settings, addCategory, updateCategory, deleteCategory } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";
  const textSec = settings.darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateCategory(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor(PALETTE[0]);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />

        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">🗂 Categories</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: bgColAlt }}><X size={20} color={textCol} /></button>
        </div>

        <div className="space-y-3 mb-6">
          {categories.map(cat => (
            <div key={cat.id} className="rounded-2xl p-4" style={{ background: bgColAlt, border: `1px solid ${editingId === cat.id ? settings.accentColor : `${cat.color}33`}` }}>
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="w-full p-3 rounded-xl outline-none font-bold"
                    style={{ background: bgCol, border: `1px solid ${borderCol}`, color: textCol }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map(c => (
                      <button key={c} onClick={() => setEditColor(c)} className="w-8 h-8 rounded-full transition-transform" style={{ backgroundColor: c, border: `3px solid ${editColor === c ? '#fff' : 'transparent'}`, transform: editColor === c ? 'scale(1.15)' : 'scale(1)' }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: bgCol, color: textCol }}>Cancel</button>
                    <button onClick={saveEdit} className="flex-1 py-3 rounded-xl font-bold text-sm text-black" style={{ backgroundColor: settings.accentColor }}>Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 font-bold text-[15px]">{cat.name}</span>
                  <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bgCol }}><Pencil size={14} color={textCol} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bgCol }}><Trash2 size={14} color="#FF453A" /></button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Category */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: bgColAlt, border: `2px dashed ${borderCol}` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textSec }}>New Category</p>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Category name..."
            className="w-full p-3 rounded-xl outline-none font-bold"
            style={{ background: bgCol, border: `1px solid ${borderCol}`, color: textCol }}
          />
          <div className="flex flex-wrap gap-2">
            {PALETTE.map(c => (
              <button key={c} onClick={() => setNewColor(c)} className="w-8 h-8 rounded-full transition-transform" style={{ backgroundColor: c, border: `3px solid ${newColor === c ? '#fff' : 'transparent'}`, transform: newColor === c ? 'scale(1.15)' : 'scale(1)' }} />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-3 rounded-xl font-extrabold text-black disabled:opacity-30 transition"
            style={{ backgroundColor: settings.accentColor }}
          >
            <Plus size={16} className="inline mr-1" /> Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
