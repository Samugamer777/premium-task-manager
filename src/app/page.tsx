import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#30D158] selection:text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-5xl mx-auto">
        <div className="text-xl font-bold tracking-tight">Focus<span className="text-[#30D158]">Task</span></div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">Log in</Link>
          <Link href="#pricing" className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-medium text-gray-300">
          ✨ The Ultimate Productivity Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Manage your life.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#30D158] to-[#0A84FF]">
            Without the chaos.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A premium minimalist task manager built for people who want to get things done. 
          Kanban boards, extreme focus modes, customizable themes, and robust categorization.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-[#30D158] hover:bg-[#28b049] text-black rounded-full font-bold text-lg transition shadow-[0_0_40px_rgba(48,209,88,0.3)]">
            Start for just $1
          </Link>
          <Link href="/app" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white rounded-full font-bold text-lg transition">
            View Live Demo
          </Link>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-20 relative mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-[#1C1C1E] shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-60"></div>
          <div className="text-gray-500 font-mono text-sm z-20">
            [ Interactive Task Manager Preview ]
            <br/><br/>
            (Click "View Live Demo" to see the real app)
          </div>
        </div>
      </main>

      {/* Features Showcase */}
      <section className="bg-[#0a0a0c] py-32 border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need. <br/><span className="text-gray-500">Nothing you don't.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🎯"
              title="Focus Mode"
              description="Eliminate distractions. Center your screen on a single task and crush it absolutely."
            />
            <FeatureCard 
              icon="📊"
              title="Smart Analytics"
              description="Track your completion rates, blockages, and priority breakdowns instantly."
            />
            <FeatureCard 
              icon="🎨"
              title="Custom Themes"
              description="Make it yours. Choose from curated palettes to match your exact aesthetic."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#30D158] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, honest pricing.</h2>
          <p className="text-xl text-gray-400 mb-12">No complicated tiers. No hidden fees.</p>
          
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-10 max-w-md mx-auto shadow-2xl relative">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-[#30D158] text-black text-xs font-bold px-3 py-1 rounded-full transform rotate-3">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
            <div className="text-6xl font-extrabold mb-6 tracking-tight">
              $1<span className="text-2xl text-gray-500 font-normal">/mo</span>
            </div>
            <ul className="text-left space-y-4 mb-8 text-gray-300">
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Unlimited tasks</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Kanban UI & Calendar</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Local-first lightning speed</li>
              <li className="flex items-center gap-3"><span className="text-[#30D158]">✓</span> Secure cloud backups</li>
            </ul>
            
            {/* 
              This is where the user will put their Stripe Payment Link!
              e.g., href="https://buy.stripe.com/test_12345"
            */}
            <Link href="/checkout" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition text-lg">
              Subscribe Now
            </Link>
            <p className="text-sm text-gray-500 mt-4">Cancel anytime. 7-day money-back guarantee.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} FocusTask. Built with passion.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-[#111113] border border-gray-800 p-8 rounded-2xl hover:border-gray-700 transition">
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
