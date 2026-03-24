import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-[#30D158]/20 rounded-full flex items-center justify-center mb-8 border border-[#30D158]/30">
        <span className="text-5xl">🎉</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">You're officially Pro.</h1>
      <p className="text-xl text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
        Thank you for subscribing! Your $1 payment was successful. Welcome to effortless productivity.
      </p>
      
      <div className="bg-[#1C1C1E] p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
        <h3 className="text-lg font-bold mb-6 text-white text-left border-b border-gray-800 pb-4">Next Steps</h3>
        <ul className="text-left space-y-4 mb-8 text-gray-300">
          <li className="flex items-center gap-3">
            <span className="bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono">1</span>
            Access your Pro Dashboard
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono">2</span>
            Create your custom categories
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono">3</span>
            Crush your goals!
          </li>
        </ul>
        <Link href="/app" className="block w-full py-4 bg-[#30D158] hover:bg-[#28b049] text-black font-bold rounded-xl transition text-lg shadow-[0_0_20px_rgba(48,209,88,0.2)]">
          Open Task Manager
        </Link>
      </div>

      <div className="mt-12 max-w-xl text-xs text-gray-500 text-left border border-dashed border-gray-800 p-6 rounded-xl bg-gray-900/50">
        <strong className="text-gray-300 block mb-2">DEVELOPER NOTE:</strong>
        This is a mock checkout success page. In reality, you'll configure your <strong>Stripe Payment Link</strong> to redirect the user to <code className="text-[#30D158]">yoursite.com/checkout</code> (this page) after a successful payment! This creates a seamless flow. Check out Stripe's "Post-payment redirect" option.
      </div>
    </div>
  );
}
