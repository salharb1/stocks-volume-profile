// Small presentational helpers for idle / loading / error / empty states.

export function ErrorBanner({ message }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
      {message}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent" />
      Building volume profile…
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-500">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" />
        <rect x="6" y="13" width="8" height="3" rx="1" />
        <rect x="6" y="8" width="12" height="3" rx="1" />
      </svg>
      <p className="max-w-xs text-sm">
        Search a US ticker to see where volume has concentrated and find key entry zones.
      </p>
    </div>
  )
}
