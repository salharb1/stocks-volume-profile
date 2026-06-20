import { useState } from 'react'

const LOOKBACKS = [30, 60, 90]

export default function SearchBar({ symbol, setSymbol, lookback, onLookback, onSubmit, loading }) {
  const [local, setLocal] = useState(symbol)

  function submit(e) {
    e.preventDefault()
    const value = local.trim().toUpperCase()
    setSymbol(value)
    onSubmit(value)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={submit} className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {/* search glyph */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
        </span>

        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search a US ticker — AAPL, TSLA, NVDA…"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="w-full rounded-2xl bg-panel/80 border border-white/10 pl-11 pr-28 py-4
                     text-lg tracking-wide placeholder:text-slate-500
                     focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/40
                     transition shadow-lg shadow-black/30"
        />

        <button
          type="submit"
          disabled={loading || !local.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent px-5 py-2.5
                     font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-blue-500 active:scale-[0.98] transition"
        >
          {loading ? 'Loading…' : 'Analyze'}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-xs uppercase tracking-widest text-slate-500">Lookback</span>
        <div className="inline-flex rounded-lg bg-panel/70 border border-white/10 p-1">
          {LOOKBACKS.map((d) => (
            <button
              key={d}
              onClick={() => onLookback(d)}
              className={`px-3 py-1 text-sm rounded-md transition ${
                lookback === d
                  ? 'bg-accent text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
