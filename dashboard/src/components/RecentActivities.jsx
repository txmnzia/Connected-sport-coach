function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtPace(s) {
  if (!s || s <= 0) return '—'
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}/km`
}

export default function RecentActivities({ activities }) {
  const recent = [...(activities ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)

  if (!recent.length) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Recent runs</p>
      <div>
        <div className="grid grid-cols-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Date</span>
          <span className="text-right">Distance</span>
          <span className="text-right">Pace</span>
          <span className="text-right">Heart Rate</span>
        </div>
        {recent.map((a, i) => (
          <div key={a.activity_id ?? i} className="grid grid-cols-4 py-2.5 border-t border-slate-50 text-sm">
            <span className="text-slate-500">{fmtDate(a.date)}</span>
            <span className="text-right font-semibold text-slate-700">{a.distance_km}km</span>
            <span className="text-right text-slate-600">{fmtPace(a.avg_pace_s)}</span>
            <span className="text-right text-slate-500">{a.avg_hr ? `${Math.round(a.avg_hr)} bpm` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
