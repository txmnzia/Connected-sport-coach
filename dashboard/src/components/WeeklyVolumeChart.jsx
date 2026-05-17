import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

function shortWeek(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-700 mb-0.5">Week of {label}</p>
      <p className="text-blue-600">{payload[0].value} km</p>
      <p className="text-slate-400">{payload[0].payload.runs} run{payload[0].payload.runs !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function WeeklyVolumeChart({ volumes, avgKm }) {
  if (!volumes?.length) return null

  const chartData = volumes.map(v => ({
    ...v,
    week: shortWeek(v.week_start),
  }))

  const lastIdx = chartData.length - 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Volume</p>
        {avgKm && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-px border-t-2 border-dashed border-slate-400 inline-block" />
            <span className="text-xs text-slate-400">{avgKm}km avg (4w)</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            unit="km"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          {avgKm && (
            <ReferenceLine y={avgKm} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
          )}
          <Bar dataKey="total_km" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={i === lastIdx ? '#3b82f6' : '#bfdbfe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-1">Current week highlighted in blue</p>
    </div>
  )
}
