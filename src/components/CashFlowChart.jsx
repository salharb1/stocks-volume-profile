import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts'

function formatBillions(value) {
  if (value === null || value === undefined) return 'N/A'
  const abs = Math.abs(value)
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${(value / 1e6).toFixed(0)}M`
  return `${(value / 1e3).toFixed(0)}K`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-[#1e2130] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-200">FY {label}</p>
      <p className="text-slate-400">
        OCF: <span className="text-slate-200">${formatBillions(d.operatingCashFlow)}</span>
      </p>
      <p className="text-slate-400">
        CapEx: <span className="text-slate-200">${formatBillions(d.capEx)}</span>
      </p>
      <p className="mt-1 font-semibold text-slate-400">
        FCF:{' '}
        <span className={d.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          ${formatBillions(d.freeCashFlow)}
        </span>
      </p>
    </div>
  )
}

export default function CashFlowChart({ data, symbol }) {
  if (!data || data.length === 0) return null

  const trend =
    data.length >= 2
      ? data[data.length - 1].freeCashFlow - data[0].freeCashFlow
      : null

  return (
    <div className="rounded-3xl border border-white/10 bg-panel/50 p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          {symbol} · Free Cash Flow from Operations
        </h3>
        {trend !== null && (
          <span
            className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend / 1e9) >= 0.1 ? formatBillions(Math.abs(trend)) : formatBillions(Math.abs(trend))} vs {data[0].year}
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Annual operating cash flow minus capital expenditures (last {data.length} fiscal years).
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatBillions}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Bar dataKey="freeCashFlow" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.year}
                fill={entry.freeCashFlow >= 0 ? '#34d399' : '#fb7185'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
