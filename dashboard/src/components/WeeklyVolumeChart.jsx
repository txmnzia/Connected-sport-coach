import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

function shortWeek(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
      <p className="font-semibold text-slate-700 mb-0.5">Week of {shortWeek(d.week_start)}</p>
      <p className="text-blue-600">{d.total_km} km</p>
      <p className="text-slate-400">{d.runs} run{d.runs !== 1 ? 's' : ''}</p>
    </div>
  )
}

function buildSummary(volumes, avgKm) {
  if (!volumes?.length) return null
  const current = volumes[volumes.length - 1]
  const prev = volumes[volumes.length - 2]
  if (!current || !avgKm) return null

  const diff = current.total_km - (prev?.total_km ?? avgKm)
  const trend = diff > 2 ? `up ${diff.toFixed(1)}km from last week`
    : diff < -2 ? `down ${Math.abs(diff).toFixed(1)}km from last week`
    : 'similar to last week'

  const vsAvg = current.total_km - avgKm
  const vsAvgText = Math.abs(vsAvg) < 2 ? 'in line with your 4-week average'
    : vsAvg > 0 ? `${vsAvg.toFixed(1)}km above your 4-week average`
    : `${Math.abs(vsAvg).toFixed(1)}km below your 4-week average`

  return `This week: ${current.total_km}km — ${trend}, ${vsAvgText}.`
}

export default function WeeklyVolumeChart({ volumes, avgKm }) {
  if (!volumes?.length) return null
  const lastIdx = volumes.length - 1
  const summary = buildSummary(volumes, avgKm)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
        Weekly distance — last 12 weeks
      </p>
      {summary && <p className="text-sm text-slate-600 mb-5">{summary}</p>}

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={volumes} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="week_start" tickFormatter={shortWeek} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="km" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          {avgKm && <ReferenceLine y={avgKm} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />}
          <Bar dataKey="total_km" radius={[4, 4, 0, 0]}>
            {volumes.map((_, i) => <Cell key={i} fill={i === lastIdx ? '#3b82f6' : '#bfdbfe'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-slate-400 mt-2">
        Current week in blue · Dashed line = 4-week average ({avgKm}km)
      </p>
    </div>
  )
}
