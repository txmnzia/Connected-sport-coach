const HRV_STATUS = {
  elevated:       { color: 'text-emerald-600', label: 'Elevated ↑' },
  normal:         { color: 'text-slate-600',   label: 'Normal' },
  below_baseline: { color: 'text-amber-600',   label: 'Below baseline ↓' },
  suppressed:     { color: 'text-red-600',      label: 'Suppressed ↓↓' },
  unknown:        { color: 'text-slate-400',   label: 'No data' },
}

function Row({ icon, label, value, sub, valueColor }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xl w-7 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-sm font-semibold ${valueColor ?? 'text-slate-800'}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function RecoveryCard({ data }) {
  if (!data) return null
  const hrv = HRV_STATUS[data.hrv_status] ?? HRV_STATUS.unknown

  const batteryLabel = data.body_battery != null ? `${data.body_battery}%` : '—'
  const batteryColor = data.body_battery >= 70 ? 'text-emerald-600' : data.body_battery >= 40 ? 'text-amber-600' : 'text-red-600'

  const hrvLabel = data.hrv_7day_avg != null
    ? `${data.hrv_7day_avg} ms`
    : '—'
  const hrvSub = data.hrv_baseline ? `Baseline: ${data.hrv_baseline} ms` : undefined

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recovery</p>
      <div className="divide-y divide-slate-100">
        <Row icon="💓" label="HRV (7-day avg)" value={hrvLabel} sub={hrvSub} valueColor={hrv.color} />
        <Row icon="⚡" label="Body battery" value={batteryLabel} valueColor={batteryColor} />
        {data.resting_hr && (
          <Row icon="🫀" label="Resting HR" value={`${data.resting_hr} bpm`} sub={data.resting_hr_baseline ? `Baseline: ${data.resting_hr_baseline} bpm` : undefined} />
        )}
      </div>
    </div>
  )
}
