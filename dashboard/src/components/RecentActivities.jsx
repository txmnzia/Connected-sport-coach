function fmtDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtPace(secondsPerKm) {
  if (!secondsPerKm || secondsPerKm <= 0) return '—'
  const m = Math.floor(secondsPerKm / 60)
  const s = Math.round(secondsPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RecentActivities({ activities }) {
  const recent = [...(activities ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  if (!recent.length) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Recent Runs</p>
      <div className="space-y-0 -mx-1">
        <div className="grid grid-cols-4 px-1 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <span>Date</span>
          <span className="text-right">Dist</span>
          <span className="text-right">Pace</span>
          <span className="text-right">HR</span>
        </div>
        {recent.map((a, i) => (
          <div
            key={a.activity_id ?? i}
            className="grid grid-cols-4 px-1 py-2 border-t border-slate-50 hover:bg-slate-50 rounded text-sm"
          >
            <span className="text-slate-500">{fmtDate(a.date)}</span>
            <span className="text-right font-medium text-slate-700">{a.distance_km}km</span>
            <span className="text-right text-slate-600">{fmtPace(a.avg_pace_s)}/km</span>
            <span className="text-right text-slate-500">{a.avg_hr ? `${a.avg_hr}` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
