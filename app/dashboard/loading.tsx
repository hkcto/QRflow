/** Instant skeleton while a dashboard route fetches its data. */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-80 max-w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-7 w-12 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex gap-4">
              <div className="h-[88px] w-[88px] shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
                <div className="h-3 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
              </div>
            </div>
            <div className="mt-4 h-8 w-full rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
