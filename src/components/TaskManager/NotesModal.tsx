"use client";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { X, Plus, Trash2 } from "lucide-react";

const NOTE_COLORS = ["#FFD60A", "#FF9F0A", "#FF375F", "#BF5AF2", "#0A84FF", "#30D158"];

export function NotesModal({ onClose }: { onClose: () => void }) {
  const { notes, settings, addNote, updateNote, deleteNote } = useStore();
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState(NOTE_COLORS[0]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const bgCol = settings.darkMode ? "#1C1C1E" : "#FFFFFF";
  const bgColAlt = settings.darkMode ? "#2C2C2E" : "#F2F2F7";
  const borderCol = settings.darkMode ? "#3A3A3C" : "#E5E5EA";
  const textCol = settings.darkMode ? "#FFFFFF" : "#000000";

  const handleAdd = () => {
    if (!newText.trim()) return;
    addNote(newText.trim(), newColor);
    setNewText("");
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 shadow-2xl relative" style={{ backgroundColor: bgCol, color: textCol }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ backgroundColor: borderCol }} />

        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold">📝 Quick Notes</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: bgColAlt }}><X size={20} color={textCol} /></button>
        </div>

        {/* Add Note */}
        <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: bgColAlt, border: `1px solid ${borderCol}` }}>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Jot something down..."
            rows={3}
            className="w-full p-3 rounded-xl outline-none text-sm resize-none font-medium"
            style={{ backgroundColor: bgCol, border: `1px solid ${borderCol}`, color: textCol }}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {NOTE_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} className="w-6 h-6 rounded-full transition-transform" style={{ backgroundColor: c, transform: newColor === c ? "scale(1.2)" : "scale(1)", border: newColor === c ? "2px solid #fff" : "none" }} />
              ))}
            </div>
            <button onClick={handleAdd} disabled={!newText.trim()} className="px-5 py-2 rounded-xl font-bold text-sm text-black disabled:opacity-30" style={{ backgroundColor: settings.accentColor }}>
              <Plus size={14} className="inline mr-1" /> Add
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-2 gap-3">
          {notes.map(note => (
            <div key={note.id} className="rounded-2xl p-4 relative group" style={{ backgroundColor: `${note.color}22`, border: `1px solid ${note.color}33` }}>
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                style={{ backgroundColor: bgCol }}
              >
                <Trash2 size={12} color="#FF453A" />
              </button>

              {editId === note.id ? (
                <textarea
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={() => { updateNote(note.id, editText); setEditId(null); }}
                  className="w-full bg-transparent outline-none text-sm resize-none font-medium"
                  style={{ color: textCol }}
                  rows={4}
                />
              ) : (
                <p
                  onClick={() => { setEditId(note.id); setEditText(note.text); }}
                  className="text-sm font-medium cursor-pointer whitespace-pre-wrap leading-relaxed"
                  style={{ color: textCol }}
                >
                  {note.text}
                </p>
              )}
              <p className="text-[9px] mt-3 font-bold uppercase" style={{ color: note.color }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="font-bold">No notes yet</p>
            <p className="text-xs mt-1" style={{ color: "gray" }}>Jot down ideas, links, or reminders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
