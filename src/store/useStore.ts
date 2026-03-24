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
}

interface AppState {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  settings: AppSettings;
  stats: UserStats;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'done'>) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  toggleTaskDone: (id: number) => void;
  moveTask: (id: number, col: KanbanCol) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: number, cat: Partial<Category>) => void;
  deleteCategory: (id: number) => void;

  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: number, p: Partial<Project>) => void;
  deleteProject: (id: number) => void;

  updateSettings: (settings: Partial<AppSettings>) => void;
  recordActivity: () => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Personal', color: '#7B8FFF' },
  { id: 2, name: 'Work', color: '#4DD9D9' },
  { id: 3, name: 'Health', color: '#6FCF6F' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      projects: [],
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

          // If it's recurring and being completed, clone it or reset it for next due date
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

          return { ...t, done: completing, kanban: completing ? 'Done' : t.kanban };
        });

        // Update stats if we completed a task
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

      updateSettings: (newSett) => set((state) => ({ settings: { ...state.settings, ...newSett } })),

      recordActivity: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.stats.lastActive === today) return state; // already recorded

        let newStreak = state.stats.streak;
        if (state.stats.lastActive) {
          const last = new Date(state.stats.lastActive);
          const current = new Date(today);
          const diff = (current.getTime() - last.getTime()) / 86400000;
          if (diff === 1) newStreak += 1; // consecutive day
          else if (diff > 1) newStreak = 1; // reset streak
        } else {
          newStreak = 1;
        }

        return { stats: { ...state.stats, lastActive: today, streak: newStreak } };
      })

    }),
    {
      name: 'premium-task-manager-storage',
    }
  )
);
