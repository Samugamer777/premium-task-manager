"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (key.trim().length > 5) {
      // In a real app, this verifies via API!
      localStorage.setItem("tm_license_key", key.trim());
      router.push("/app");
    } else {
      setError("Invalid License Key");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-4xl font-extrabold mb-4">Welcome Back.</h1>
      <p className="text-gray-400 mb-8">Enter the License Key you received in your email after purchase.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input 
          type="text" 
          value={key} 
          onChange={e => setKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-XXXX" 
          className="w-full p-4 rounded-xl bg-[#1C1C1E] border border-gray-800 focus:border-[#30D158] outline-none text-center"
        />
        {error && <p className="text-[#FF453A] text-sm">{error}</p>}
        <button type="submit" className="w-full py-4 bg-[#30D158] text-black font-bold rounded-xl transition hover:opacity-90">
          Unlock App
        </button>
      </form>
    </div>
  );
}
