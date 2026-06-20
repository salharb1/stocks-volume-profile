import { formatPrice } from '../lib/volumeProfile'

/** The actionable "so what" card. */
export default function SummaryCard({ profile, symbol }) {
  const { poc, valueAreaLow, valueAreaHigh, lastClose, periodDays } = profile

  const relation =
    lastClose > valueAreaHigh
      ? { text: 'Price is trading above the value area — the POC may act as support on pullbacks.', tone: 'text-emerald-400' }
      : lastClose < valueAreaLow
        ? { text: 'Price is trading below the value area — the POC may act as resistance on bounces.', tone: 'text-rose-400' }
        : { text: 'Price is inside the value area — a fair-value zone; expect two-way trade.', tone: 'text-slate-300' }

  return (
    <div className="rounded-3xl border border-poc/25 bg-panel/70 p-6 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex items-center gap-2 text-poc">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
        <h2 className="text-sm font-semibold uppercase tracking-widest">Key Entry Zone</h2>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        High Volume Node detected for <span className="font-semibold text-slate-200">{symbol}</span> at
      </p>
      <p className="mt-1 text-5xl font-extrabold tracking-tight text-white">
        {formatPrice(poc.mid)}
      </p>

      <div className="my-5 h-px bg-white/10" />

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Value Low" value={formatPrice(valueAreaLow)} />
        <Stat label="Last Close" value={formatPrice(lastClose)} highlight />
        <Stat label="Value High" value={formatPrice(valueAreaHigh)} />
      </div>

      <p className={`mt-5 text-sm ${relation.tone}`}>{relation.text}</p>
      <p className="mt-2 text-xs text-slate-500">Based on the last {periodDays} trading days.</p>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 font-semibold ${highlight ? 'text-poc' : 'text-slate-200'}`}>
        {value}
      </div>
    </div>
  )
}
