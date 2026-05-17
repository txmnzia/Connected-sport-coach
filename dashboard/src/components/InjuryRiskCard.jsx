const RISK = {
  low:        { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' },
  moderate:   { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-500',   text: 'text-amber-700' },
  high:       { bg: 'bg-orange-50',  border: 'border-orange-200',  badge: 'bg-orange-500',  text: 'text-orange-700' },
  'very high':{ bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-500',     text: 'text-red-700' },
}

const FACTOR_STATUS = {
  ok:             { dot: 'bg-emerald-400', label: 'OK' },
  low:            { dot: 'bg-blue-400',    label: 'Low' },
  elevated:       { dot: 'bg-amber-400',   label: 'Elevated' },
  moderate:       { dot: 'bg-amber-400',   label: 'Moderate' },
  high:           { dot: 'bg-orange-400',  label: 'High' },
  normal:         { dot: 'bg-emerald-400', label: 'Normal' },
  below_baseline: { dot: 'bg-amber-400',   label: 'Below baseline' },
  suppressed:     { dot: 'bg-red-400',     label: 'Suppressed' },
  poor:           { dot: 'bg-orange-400',  label: 'Poor' },
  unknown:        { dot: 'bg-slate-300',   label: 'No data' },
}

function Factor({ label, status }) {
  const cfg = FACTOR_STATUS[status] ?? FACTOR_STATUS.unknown
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-sm font-medium text-slate-700">{cfg.label}</span>
      </div>
    </div>
  )
}

export default function InjuryRiskCard({ data, load }) {
  if (!data) return null
  const cfg = RISK[data.label] ?? RISK.moderate

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Injury Risk</p>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${cfg.badge}`} />
            <span className={`text-2xl font-bold uppercase ${cfg.text}`}>{data.label}</span>
          </div>
          <p className="text-slate-600 text-sm">{data.message}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-4xl font-bold ${cfg.text}`}>{data.score}</span>
          <span className="text-slate-400 text-sm">/100</span>
        </div>
      </div>

      {data.factors && (
        <div className="divide-y divide-slate-200/60">
          {Object.values(data.factors).map(f => (
            <Factor key={f.label} label={f.label} status={f.status} />
          ))}
        </div>
      )}

      {load?.acwr && (
        <p className="text-xs text-slate-400 mt-3">
          Load ratio: {load.acwr} · Weekly: {load.weekly_km}km vs {load.avg_4week_km}km avg
        </p>
      )}
    </div>
  )
}
