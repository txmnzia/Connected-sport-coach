function EffortBar({ label, km, color, max }) {
  const pct = max > 0 ? (km / max) * 100 : 0
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xl font-bold text-slate-900">{km} <span className="text-sm font-normal text-slate-400">km</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MaxDistanceCard({ data }) {
  if (!data) return null
  const max = data.easy_km || 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Max Safe Distance</p>
      <div className="grid grid-cols-3 gap-6">
        <EffortBar label="Easy" km={data.easy_km} color="bg-emerald-400" max={max} />
        <EffortBar label="Moderate" km={data.moderate_km} color="bg-amber-400" max={max} />
        <EffortBar label="Hard" km={data.hard_km} color="bg-orange-400" max={max} />
      </div>
      {data.basis_km && (
        <p className="text-xs text-slate-400 mt-4">
          Based on your {data.basis_km}km run on {data.basis_date} · Easy allows +20% safe progression
        </p>
      )}
    </div>
  )
}
