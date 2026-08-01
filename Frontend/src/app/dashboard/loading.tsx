export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="h-[300px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
