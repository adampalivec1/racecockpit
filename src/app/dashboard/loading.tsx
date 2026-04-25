export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#1a1a2e] p-4 lg:p-6 animate-pulse">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="h-6 w-48 bg-[#16213e] rounded" />
        <div className="h-28 bg-[#16213e] rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#16213e] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-[#16213e] rounded-xl" />
          <div className="h-64 bg-[#16213e] rounded-xl" />
        </div>
        <div className="h-40 bg-[#16213e] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-[#16213e] rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
