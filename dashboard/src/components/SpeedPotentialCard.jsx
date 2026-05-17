export default function SpeedPotentialCard({ data }) {
  if (!data || data.comfortable_pace === 'N/A') return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Speed Potential</p>
      <p className="text-slate-400 text-sm">Not enough data yet — run at least 3 sessions over 4km.</p>
    </div>
  )

  const readiness = data.readiness_pct ?? 100
  const readinessColor = readiness >= 97 ? 'text-emerald-600' : readiness >= 93 ? 'text-amber-600' : 'text-orange-600'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Speed Potential — 5K</p>
        <span className={`text-xs font-semibold ${readinessColor}`}>
          {readiness}% readiness
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-1">Comfortable</p>
          <p className="text-3xl font-bold text-blue-700">{data.comfortable_pace}</p>
          <p className="text-xs text-blue-400 mt-1">per km · sustainable effort</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Max push</p>
          <p className="text-3xl font-bold text-slate-800">{data.max_pace}</p>
          <p className="text-xs text-slate-400 mt-1">per km · high recovery cost</p>
        </div>
      </div>

      {data.best_pace && data.best_pace !== 'N/A' && (
        <p className="text-xs text-slate-400 mt-3">
          Based on your best recent pace of {data.best_pace}/km over runs &gt;4km
        </p>
      )}
    </div>
  )
}
