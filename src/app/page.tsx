import Link from "next/link";

const FEATURES = [
  { icon: "⏱", title: "Pomodoro Timer", desc: "Built-in 25/5 focus timer to maximize deep work sessions." },
  { icon: "🗂", title: "Kanban Board", desc: "Drag tasks between To Do, In Progress, and Done columns." },
  { icon: "📅", title: "Calendar View", desc: "See all your tasks plotted on a monthly calendar by due date." },
  { icon: "🎯", title: "Focus Mode", desc: "Hide everything except your most urgent task. Zero distractions." },
  { icon: "🔁", title: "Recurring Tasks", desc: "Set daily, weekly, or monthly habits that auto-renew." },
  { icon: "📎", title: "Subtasks", desc: "Break big tasks into small checkable steps with progress bars." },
  { icon: "🌙", title: "Dark & Light Mode", desc: "Switch themes instantly. Your eyes will thank you." },
  { icon: "🏷", title: "Tags & Categories", desc: "Organize with custom categories, colors, and free-form tags." },
  { icon: "📊", title: "Smart Suggestions", desc: "AI-ranked 'Up Next' card tells you what to tackle first." },
  { icon: "🎉", title: "Confetti Effects", desc: "Celebrate completing tasks with satisfying particle animations." },
  { icon: "💾", title: "Backup & Sync", desc: "Export/import JSON backups to transfer data between devices." },
  { icon: "🔔", title: "Smart Alerts", desc: "See overdue and upcoming deadlines in your notification center." },
];

const TESTIMONIALS = [
  { name: "María G.", role: "University Student", avatar: "🎓", text: "FocusTask changed how I study. The Pomodoro timer + subtasks combo is incredible for exam prep. Best $1 I've ever spent!" },
  { name: "Carlos R.", role: "Freelance Designer", avatar: "🎨", text: "I tried Notion, Todoist, and TickTick. FocusTask is the only one that doesn't overwhelm me. Clean, fast, beautiful." },
  { name: "Ana P.", role: "Project Manager", avatar: "💼", text: "The Kanban board and smart suggestions keep my team aligned. The dark mode is gorgeous. Highly recommended!" },
  { name: "Diego M.", role: "Software Developer", avatar: "💻", text: "Finally a task app that respects my workflow. Recurring tasks + focus mode = unstoppable productivity." },
  { name: "Laura S.", role: "Content Creator", avatar: "📱", text: "Love the confetti when I complete tasks! It's the little things that keep me motivated. And for only $1/month? Steal!" },
  { name: "Andrés T.", role: "Entrepreneur", avatar: "🚀", text: "I manage 3 businesses from this app. Categories + tags make it possible. The calendar view is a game changer." },
];

// Fake non-interactive preview tasks
const PREVIEW_TASKS = [
  { title: "Finish project proposal", priority: "High", cat: "Work", catColor: "#4DD9D9", due: "Mar 25", done: false, subtasks: "2/4" },
  { title: "Morning workout routine", priority: "Medium", cat: "Health", catColor: "#6FCF6F", due: "Daily", done: false, recurrence: "daily" },
  { title: "Buy groceries", priority: "Low", cat: "Personal", catColor: "#7B8FFF", due: "Mar 26", done: true, subtasks: "3/3" },
  { title: "Read 30 pages", priority: "Medium", cat: "Personal", catColor: "#7B8FFF", due: "Mar 24", done: false },
];

const PRI_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FF453A22", text: "#FF453A" },
  Medium: { bg: "#FF9F0A22", text: "#FF9F0A" },
  Low: { bg: "#30D15822", text: "#30D158" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#30D158] selection:text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-5xl mx-auto">
        <div className="text-xl font-bold tracking-tight">Focus<span className="text-[#30D158]">Task</span></div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">License Login</Link>
          <Link href="#pricing" className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-medium text-[#30D158]">
          ✨ 3-Day Free Trial · No Credit Card Required
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Manage your life.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#30D158] to-[#0A84FF]">
            Without the chaos.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A premium task manager with Kanban boards, Pomodoro timer, focus mode, smart suggestions, and beautiful themes. Built for people who get things done.
        </p>
        <Link href="/app" className="inline-block px-8 py-4 bg-[#30D158] hover:bg-[#28b049] text-black rounded-full font-bold text-lg transition shadow-[0_0_40px_rgba(48,209,88,0.3)]">
          Start Free Trial →
        </Link>
      </main>

      {/* ─── LIVE PREVIEW (Non-interactive) ─── */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-[#30D158] mb-3">Live Preview</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">See it in action.</h2>

          {/* Fake App Shell */}
          <div className="bg-[#000] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl" style={{ boxShadow: "0 40px 80px rgba(48,209,88,0.08)" }}>
            {/* Fake Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">👤</div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Good morning,</p>
                    <p className="text-base font-black">User</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center text-sm">🔔</div>
                  <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center text-sm">⚙️</div>
                </div>
              </div>
              {/* Fake Progress */}
              <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-gray-800">
                <div className="flex justify-between items-center mb-1.5">
                  <div><span className="text-xl font-black text-[#30D158]">1</span> <span className="text-xs text-gray-500">/ 4 tasks</span></div>
                  <span className="text-[11px] text-gray-500">🔥 3 day streak</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-[#30D158] rounded-full" style={{ width: "25%" }} /></div>
              </div>
            </div>

            {/* Fake Task Cards */}
            <div className="px-5 pb-5 space-y-2.5">
              {PREVIEW_TASKS.map((t, i) => {
                const pc = PRI_COLORS[t.priority];
                return (
                  <div key={i} className="flex rounded-2xl overflow-hidden border" style={{ borderColor: "#2C2C2E", opacity: t.done ? 0.45 : 1 }}>
                    <div className="w-1" style={{ backgroundColor: t.catColor }} />
                    <div className="flex-1 p-3 bg-[#1C1C1E]">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-sm" style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: t.done ? "#30D158" : "#3A3A3C", backgroundColor: t.done ? "#30D158" : "transparent" }}>
                          {t.done && <span className="text-[9px] text-black font-black">✓</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: pc.bg, color: pc.text }}>{t.priority}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${t.catColor}22`, color: t.catColor }}>{t.cat}</span>
                        {t.recurrence && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">🔁 {t.recurrence}</span>}
                        {t.subtasks && <span className="text-[9px] text-gray-500">📎 {t.subtasks}</span>}
                      </div>
                      {t.due && <p className="text-[10px] text-gray-500 mt-1.5">📅 {t.due}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-4">Non-interactive preview · The real app is even better!</p>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 border-t border-gray-900 bg-[#050507]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-[#30D158] mb-3">Packed with Power</p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Everything you need. Nothing you don&apos;t.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-[#111113] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#30D158] transition">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-[#30D158] mb-3">What Users Say</p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Loved by productive people.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#111113] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[11px] text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-32 relative overflow-hidden bg-[#0a0a0c] border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#30D158] mb-3">Simple Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">One plan. No surprises.</h2>
          <p className="text-xl text-gray-400 mb-12">Start free for 3 days. Then just $1/month.</p>
          
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-10 max-w-md mx-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
            <div className="text-6xl font-extrabold mb-6 tracking-tight">
              $1<span className="text-2xl text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="text-left space-y-3 mb-8 text-gray-300">
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Unlimited tasks & categories</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Kanban, Calendar & Focus Mode</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Pomodoro timer & smart suggestions</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Dark & Light themes with custom colors</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Backup & cross-device sync</li>
            </ul>
            <Link href="/app" className="block w-full py-4 bg-[#30D158] text-black font-bold rounded-xl hover:bg-[#28b049] transition text-lg text-center">
              Start Free Trial
            </Link>
            <p className="text-sm text-gray-500 mt-4">3 days free · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8">
        <p className="text-center text-sm text-gray-600">© 2026 FocusTask. Built with ❤️</p>
      </footer>
    </div>
  );
}
