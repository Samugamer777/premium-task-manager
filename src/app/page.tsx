import Link from "next/link";
import React from "react";

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

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-medium text-[#30D158]">
          ✨ Now with a 3-Day Free Trial
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Manage your life.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#30D158] to-[#0A84FF]">
            Without the chaos.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A premium minimalist task manager built for people who want to get things done. 
          Kanban boards, extreme focus modes, custom themes, and bilingual support.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app" className="w-full sm:w-auto px-8 py-4 bg-[#30D158] hover:bg-[#28b049] text-black rounded-full font-bold text-lg transition shadow-[0_0_40px_rgba(48,209,88,0.3)]">
            Start 3-Day Free Trial
          </Link>
        </div>
      </main>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden bg-[#0a0a0c] border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, honest pricing.</h2>
          <p className="text-xl text-gray-400 mb-12">No complicated tiers. Just pure productivity.</p>
          
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-10 max-w-md mx-auto shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
            <div className="text-6xl font-extrabold mb-6 tracking-tight">
              $1<span className="text-2xl text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="text-left space-y-4 mb-8 text-gray-300">
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Unlimited tasks</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Kanban UI & Calendar</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Pomodoro timer</li>
            </ul>
            
            {/* USER NOTE: Paste Lemon Squeezy link here! */}
            <Link href="/checkout" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition text-lg">
              Subscribe Now
            </Link>
            <p className="text-sm text-gray-500 mt-4">Includes a 3-Day Free Trial.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
