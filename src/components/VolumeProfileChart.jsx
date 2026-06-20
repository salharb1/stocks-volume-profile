import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatPrice, formatVolume } from '../lib/volumeProfile'

/**
 * Horizontal volume-by-price chart. Bars extend left→right by volume; the
 * y-axis is price. The POC bar and value-area bars are color-coded, and a
 * dashed reference line marks the last close.
 */
export default function VolumeProfileChart({ profile }) {
  // Recharts renders top→bottom in array order; reverse so high prices sit on top.
  const data = profile.bins
    .map((b) => ({
      price: b.mid,
      label: formatPrice(b.mid),
      volume: Math.round(b.volume),
      isPOC: b === profile.poc,
      inValueArea: b.mid >= profile.valueAreaLow && b.mid <= profile.valueAreaHigh,
    }))
    .reverse()

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <XAxis
            type="number"
            tickFormatter={formatVolume}
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#475569"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={64}
            interval={2}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: '#0b0f17',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#e2e8f0',
            }}
            formatter={(value) => [formatVolume(value), 'Volume']}
            labelFormatter={(label) => `Price ${label}`}
          />
          <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.isPOC ? '#f59e0b' : d.inValueArea ? '#3b82f6' : '#1e3a5f'}
              />
            ))}
          </Bar>
          <ReferenceLine
            y={formatPrice(profile.poc.mid)}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            label={{ value: 'POC', fill: '#f59e0b', fontSize: 11, position: 'right' }}
          />
        </BarChart>
      </ResponsiveContainer>

      <Legend />
    </div>
  )
}

function Legend() {
  const items = [
    ['#f59e0b', 'Point of Control'],
    ['#3b82f6', 'Value Area (70%)'],
    ['#1e3a5f', 'Outside Value Area'],
  ]
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
      {items.map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}
