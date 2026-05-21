export default function TrackerLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-7 w-44 rounded-lg bg-muted" />
            <div className="h-3.5 w-56 rounded bg-muted" />
          </div>
        </div>
        <div className="h-8 w-36 rounded-lg bg-muted" />
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3.5 w-20 rounded bg-muted" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50 last:border-0">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="ml-auto h-7 w-16 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
