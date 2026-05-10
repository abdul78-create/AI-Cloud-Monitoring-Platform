export const DashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      </div>
    </div>
  );
};
