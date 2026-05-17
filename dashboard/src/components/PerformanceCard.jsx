const FITNESS_BADGE = {
  improving:   { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '↑' },
  maintaining: { bg: 'bg-blue-100',    text: 'text-blue-700',    icon: '→' },
  recovering:  { bg: 'bg-purple-100',  text: 'text-purple-700',  icon: '~' },
  declining:   { bg: 'bg-slate-100',   text: 'text-slate-600',   icon: '↓' },
}

export default function PerformanceCard({ data, load }) {
  if (!data) return null
  const badge = FITNESS_BADGE[data.fitness_label] ?? FITNESS_BADGE.maintaining

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Fitness</p>

      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
          {badge.icon} {data.fitness_label.charAt(0).toUpperCase() + data.fitness_label.slice(1)}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-4">{data.fitness_message}</p>

      {data.weak_spots?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Weak spots</p>
          <ul className="space-y-1.5">
            {data.weak_spots.map((spot, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-orange-400 mt-0.5">•</span>
                {spot}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.weak_spots?.length === 0 && (
        <p className="text-sm text-emerald-600">No weak spots detected — keep it up.</p>
      )}

      {load && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-slate-400">This week</p>
            <p className="text-sm font-semibold text-slate-700">{load.weekly_km} km</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Runs (last 28d)</p>
            <p className="text-sm font-semibold text-slate-700">{data.recent_runs}</p>
          </div>
        </div>
      )}
    </div>
  )
}
