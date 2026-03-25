import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type KanbanCol = 'To Do' | 'In Progress' | 'Done';

export interface Subtask {
  id: number;
  title: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  categoryId: number;
  due: string;
  done: boolean;
  blockedBy: number[];
  subtasks: Subtask[];
  kanban: KanbanCol;
  tags: string[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  projectId?: number;
  pinned?: boolean;
  completedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface Note {
  id: number;
  text: string;
  color: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlockedAt: string | null;
}

export interface UserStats {
  streak: number;
  lastActive: string;
  completedHistory: Record<string, number>;
}

export interface AppSettings {
  language: 'en' | 'es';
  darkMode: boolean;
  accentColor: string;
  userName: string;
  profilePhoto: string | null;
  trialStart: string | null;
  licenseKey: string | null;
  weeklyGoal: number;
}

interface AppState {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  notes: Note[];
  achievements: Achievement[];
  settings: AppSettings;
  stats: UserStats;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'done'>) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskDone: (id: number) => void;
  moveTask: (id: number, col: KanbanCol) => void;
  
  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, cat: Partial<Category>) => void;
  deleteCategory: (id: number) => void;

  // Projects
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: number, p: Partial<Project>) => void;
  deleteProject: (id: number) => void;

  // Notes
  addNote: (text: string, color?: string) => void;
  updateNote: (id: number, text: string) => void;
  deleteNote: (id: number) => void;

  // Settings & Stats
  updateSettings: (settings: Partial<AppSettings>) => void;
  recordActivity: () => void;
  checkAchievements: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Personal', color: '#7B8FFF' },
  { id: 2, name: 'Work', color: '#4DD9D9' },
  { id: 3, name: 'Health', color: '#6FCF6F' },
];

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_task',    title: 'Getting Started',   desc: 'Complete your first task',   icon: '🌱' },
  { id: 'ten_tasks',     title: 'Productive 10',     desc: 'Complete 10 tasks',          icon: '⚡' },
  { id: 'fifty_tasks',   title: 'Fifty & Fabulous',  desc: 'Complete 50 tasks',          icon: '🔥' },
  { id: 'hundred_tasks', title: 'Centurion',         desc: 'Complete 100 tasks',         icon: '💯' },
  { id: 'streak_3',      title: 'On a Roll',         desc: '3-day streak',               icon: '🎯' },
  { id: 'streak_7',      title: 'Week Warrior',      desc: '7-day streak',               icon: '🏆' },
  { id: 'streak_30',     title: 'Monthly Master',    desc: '30-day streak',              icon: '👑' },
  { id: 'five_cats',     title: 'Organizer',         desc: 'Create 5 categories',        icon: '🗂' },
  { id: 'subtask_king',  title: 'Detail Oriented',   desc: 'Complete 20 subtasks',       icon: '📎' },
  { id: 'note_taker',    title: 'Note Taker',        desc: 'Create 5 notes',             icon: '📝' },
  { id: 'weekly_goal',   title: 'Goal Crusher',      desc: 'Hit your weekly goal',       icon: '🏅' },
  { id: 'all_priorities', title: 'Balanced',          desc: 'Complete tasks of all 3 priorities', icon: '⚖️' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      projects: [],
      notes: [],
      achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a, unlockedAt: null })),
      stats: {
        streak: 0,
        lastActive: '',
        completedHistory: {}
      },
      settings: {
        language: 'en',
        darkMode: true,
        accentColor: '#30D158',
        userName: 'User',
        profilePhoto: null,
        trialStart: null,
        licenseKey: null,
        weeklyGoal: 10,
      },

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Date.now(), done: false }]
      })),

      updateTask: (id, updated) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updated } : t)
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id).map(t => ({
          ...t, blockedBy: t.blockedBy.filter(bid => bid !== id)
        }))
      })),

      toggleTaskDone: (id) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newTasks = state.tasks.map(t => {
          if (t.id !== id) return t;
          const completing = !t.done;

          if (completing && t.recurrence !== 'none') {
            const due = t.due ? new Date(t.due) : new Date();
            if (t.recurrence === 'daily') due.setDate(due.getDate() + 1);
            else if (t.recurrence === 'weekly') due.setDate(due.getDate() + 7);
            else if (t.recurrence === 'monthly') due.setMonth(due.getMonth() + 1);
            
            return {
              ...t,
              done: false,
              due: due.toISOString().split('T')[0],
              subtasks: t.subtasks.map(s => ({ ...s, done: false }))
            };
          }

          return { ...t, done: completing, kanban: completing ? 'Done' as KanbanCol : t.kanban, completedAt: completing ? today : undefined };
        });

        const task = state.tasks.find(t => t.id === id);
        if (task && !task.done) {
          const stats = { ...state.stats };
          stats.completedHistory[today] = (stats.completedHistory[today] || 0) + 1;
          return { tasks: newTasks, stats };
        }

        return { tasks: newTasks };
      }),

      moveTask: (id, col) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, kanban: col, done: col === 'Done' } : t)
      })),

      addCategory: (cat) => set((state) => ({ categories: [...state.categories, { ...cat, id: Date.now() }] })),
      updateCategory: (id, updated) => set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...updated } : c) })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),

      addProject: (p) => set((state) => ({ projects: [...state.projects, { ...p, id: Date.now() }] })),
      updateProject: (id, updated) => set((state) => ({ projects: state.projects.map(p => p.id === id ? { ...p, ...updated } : p) })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),

      addNote: (text, color) => set((state) => ({ notes: [...state.notes, { id: Date.now(), text, color: color || '#FFD60A', createdAt: new Date().toISOString() }] })),
      updateNote: (id, text) => set((state) => ({ notes: state.notes.map(n => n.id === id ? { ...n, text } : n) })),
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),

      updateSettings: (newSett) => set((state) => ({ settings: { ...state.settings, ...newSett } })),

      recordActivity: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.stats.lastActive === today) return state;

        let newStreak = state.stats.streak;
        if (state.stats.lastActive) {
          const last = new Date(state.stats.lastActive);
          const current = new Date(today);
          const diff = (current.getTime() - last.getTime()) / 86400000;
          if (diff === 1) newStreak += 1;
          else if (diff > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }

        return { stats: { ...state.stats, lastActive: today, streak: newStreak } };
      }),

      checkAchievements: () => set((state) => {
        const totalDone = state.tasks.filter(t => t.done).length;
        const totalSubsDone = state.tasks.reduce((sum, t) => sum + t.subtasks.filter(s => s.done).length, 0);
        const streak = state.stats.streak;
        const catCount = state.categories.length;
        const noteCount = state.notes.length;
        const doneP = new Set(state.tasks.filter(t => t.done).map(t => t.priority));

        // Weekly goal check
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekStr = weekStart.toISOString().split('T')[0];
        let weeklyDone = 0;
        Object.entries(state.stats.completedHistory).forEach(([date, count]) => {
          if (date >= weekStr) weeklyDone += count;
        });

        const checks: Record<string, boolean> = {
          first_task: totalDone >= 1,
          ten_tasks: totalDone >= 10,
          fifty_tasks: totalDone >= 50,
          hundred_tasks: totalDone >= 100,
          streak_3: streak >= 3,
          streak_7: streak >= 7,
          streak_30: streak >= 30,
          five_cats: catCount >= 5,
          subtask_king: totalSubsDone >= 20,
          note_taker: noteCount >= 5,
          weekly_goal: weeklyDone >= state.settings.weeklyGoal,
          all_priorities: doneP.has('High') && doneP.has('Medium') && doneP.has('Low'),
        };

        const today = new Date().toISOString();
        const newAch = state.achievements.map(a => {
          if (!a.unlockedAt && checks[a.id]) return { ...a, unlockedAt: today };
          return a;
        });

        return { achievements: newAch };
      }),
    }),
    {
      name: 'premium-task-manager-storage',
    }
  )
);
