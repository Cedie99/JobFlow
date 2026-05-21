export default function DashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex gap-6 items-start">

        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-56 rounded-lg bg-muted" />
              <div className="h-4 w-40 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-36 rounded-lg bg-muted" />
              <div className="h-8 w-36 rounded-lg bg-muted" />
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-8 w-12 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="h-4 w-36 rounded bg-muted" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="h-4 w-20 rounded bg-muted" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-8 rounded bg-muted" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 shrink-0 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-muted" />
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="h-4 w-20 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-muted mt-1.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-2.5 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
