"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.active) {
        // Store session in localStorage (re-verified on each app load)
        localStorage.setItem("tft_session", JSON.stringify({
          email: email.trim().toLowerCase(),
          plan: data.plan,
          status: data.status,
          customerPortal: data.customerPortal,
          verifiedAt: new Date().toISOString(),
        }));
        router.push("/app");
      } else if (data.trial) {
        // No API key configured — allow trial mode
        localStorage.setItem("tft_session", JSON.stringify({
          email: email.trim().toLowerCase(),
          plan: "trial",
          status: "trial",
          verifiedAt: new Date().toISOString(),
        }));
        router.push("/app");
      } else {
        setError(data.error || "No active subscription found for this email.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <Link href="/" className="text-xl font-bold tracking-tight mb-12">
        The<span className="text-[#30D158]">Focus</span>Task
      </Link>
      
      <h1 className="text-4xl font-extrabold mb-4">Welcome Back.</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        Enter the email you used to subscribe. We&apos;ll verify your subscription instantly.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com" 
          className="w-full p-4 rounded-xl bg-[#1C1C1E] border border-gray-800 focus:border-[#30D158] outline-none text-center text-lg"
          disabled={loading}
        />
        {error && (
          <div className="text-[#FF453A] text-sm bg-[#FF453A22] p-3 rounded-xl">
            {error}
          </div>
        )}
        <button 
          type="submit" 
          className="w-full py-4 bg-[#30D158] text-black font-bold rounded-xl transition hover:opacity-90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Log In"}
        </button>
      </form>

      <div className="mt-8 space-y-3 text-sm text-gray-500">
        <p>Don&apos;t have an account? <Link href="/#pricing" className="text-[#30D158] font-medium">Subscribe here</Link></p>
        <p>First time? <Link href="/app" className="text-gray-400 underline">Start 3-day free trial</Link></p>
      </div>
    </div>
  );
}
