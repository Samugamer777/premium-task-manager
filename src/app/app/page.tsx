import TaskManager from "@/components/TaskManager";

export default function AppDashboard() {
  // In a real application, you would check the user's subscription status here
  // e.g., const session = await auth(); if (!session?.user?.isPro) redirect('/#pricing');
  
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#30D158] selection:text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
          <div className="text-xl font-bold tracking-tight">Focus<span className="text-[#30D158]">Task</span> <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md ml-2 border border-gray-700">PRO</span></div>
          <p className="text-sm text-gray-400">Welcome back!</p>
        </header>

        {/* 
          This is where your provided React code renders!
        */}
        <TaskManager />
      </div>
    </div>
  );
}
