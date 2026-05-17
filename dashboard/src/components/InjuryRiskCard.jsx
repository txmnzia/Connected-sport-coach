const RISK_STYLE = {
  low:        { border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'bg-emerald-500', text: 'text-emerald-700' },
  moderate:   { border: 'border-amber-200',   bg: 'bg-amber-50',   badge: 'bg-amber-500',   text: 'text-amber-700' },
  high:       { border: 'border-orange-200',  bg: 'bg-orange-50',  badge: 'bg-orange-500',  text: 'text-orange-700' },
  'very high':{ border: 'border-red-200',     bg: 'bg-red-50',     badge: 'bg-red-500',     text: 'text-red-700' },
}

const STATUS_STYLE = {
  ok:             'text-emerald-600',
  low:            'text-blue-600',
  elevated:       'text-amber-600',
  moderate:       'text-amber-600',
  high:           'text-orange-600',
  normal:         'text-emerald-600',
  below_baseline: 'text-amber-600',
  suppressed:     'text-red-600',
  poor:           'text-orange-600',
  unknown:        'text-slate-400',
}

const STATUS_LABEL = {
  ok: 'OK', low: 'Low', elevated: 'Elevated', moderate: 'Moderate',
  high: 'High', normal: 'Normal', below_baseline: 'Below your norm',
  suppressed: 'Significantly low', poor: 'Poor', unknown: 'No data',
}

function buildNarrative(injury_risk, training_load, recovery) {
  const reasons = []

  if ((training_load?.volume_spike_pct ?? 0) > 20) {
    const pct = Math.round(training_load.volume_spike_pct)
    reasons.push(`your weekly distance is ${pct}% higher than your recent average`)
  }
  if ((training_load?.acwr ?? 1) > 1.3) {
    reasons.push('your training load is elevated relative to your longer-term baseline')
  }
  if (recovery?.hrv_status === 'suppressed') {
    reasons.push('your heart rate variability is significantly below normal, a sign of accumulated fatigue')
  } else if (recovery?.hrv_status === 'below_baseline' && recovery?.hrv_7day_avg && recovery?.hrv_baseline) {
    const drop = Math.round((1 - recovery.hrv_7day_avg / recovery.hrv_baseline) * 100)
    reasons.push(`your heart rate variability is ${drop}% below your personal norm, a sign your body is still recovering`)
  }

  if (reasons.length === 0) return null

  const joined = reasons.length === 1
    ? reasons[0]
    : reasons.slice(0, -1).join(', ') + ' and ' + reasons[reasons.length - 1]

  return `This is because ${joined}.`
}

function FactorRow({ label, status, detail }) {
  const color = STATUS_STYLE[status] ?? STATUS_STYLE.unknown
  const statusText = STATUS_LABEL[status] ?? status

  return (
    <div className="py-3 border-t border-slate-100">
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-semibold ${color}`}>{statusText}</span>
      </div>
      {detail && <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>}
    </div>
  )
}

function buildFactorDetail(key, factor, training_load, recovery) {
  if (key === 'training_load') {
    const acwr = factor.acwr ?? training_load?.acwr
    if (!acwr) return null
    const status = acwr > 1.5 ? 'very high — back off now'
      : acwr > 1.3 ? 'elevated — injury risk rises above 1.3'
      : acwr < 0.8 ? 'low — you may be undertraining'
      : 'safe range'
    return `7-day vs 28-day training ratio: ${acwr} — ${status}`
  }
  if (key === 'recovery' || key === 'hrv') {
    if (recovery?.hrv_7day_avg && recovery?.hrv_baseline) {
      const diff = Math.round((1 - recovery.hrv_7day_avg / recovery.hrv_baseline) * 100)
      const dir = diff > 0 ? `${diff}% below` : `${Math.abs(diff)}% above`
      return `Your 7-day average HRV is ${recovery.hrv_7day_avg}ms — ${dir} your personal baseline of ${recovery.hrv_baseline}ms`
    }
    return 'Heart rate variability tracks how well your nervous system has recovered'
  }
  if (key === 'volume') {
    if (training_load?.weekly_km && training_load?.avg_4week_km) {
      const spike = Math.round(training_load.volume_spike_pct)
      const dir = spike > 0 ? `${spike}% more` : `${Math.abs(spike)}% less`
      return `${training_load.weekly_km}km this week vs your 4-week average of ${training_load.avg_4week_km}km — ${dir} than usual`
    }
    return null
  }
  if (key === 'resting_hr') {
    if (recovery?.resting_hr && recovery?.resting_hr_baseline) {
      const pct = Math.round((recovery.resting_hr / recovery.resting_hr_baseline - 1) * 100)
      if (pct <= 0) return `${recovery.resting_hr} bpm — same as your baseline (${recovery.resting_hr_baseline} bpm)`
      return `${recovery.resting_hr} bpm — ${pct}% above your baseline of ${recovery.resting_hr_baseline} bpm`
    }
    return null
  }
  return null
}

export default function InjuryRiskCard({ data, training_load, recovery }) {
  if (!data) return null
  const style = RISK_STYLE[data.label] ?? RISK_STYLE.moderate
  const narrative = buildNarrative(data, training_load, recovery)
  const LABEL_MAP = { low: 'Low', moderate: 'Medium', high: 'High', 'very high': 'Very High' }

  const factors = Object.entries(data.factors ?? {}).filter(([k]) => k !== 'sleep')

  return (
    <div className={`rounded-2xl border p-6 ${style.bg} ${style.border}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Injury Risk</p>

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full shrink-0 mt-1 ${style.badge}`} />
          <span className={`text-3xl font-bold ${style.text}`}>
            {LABEL_MAP[data.label] ?? data.label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-4xl font-bold ${style.text}`}>{data.score}</span>
          <span className="text-slate-400 text-sm"> / 100</span>
        </div>
      </div>

      {narrative && (
        <p className="text-sm text-slate-700 leading-relaxed mb-1">{narrative}</p>
      )}
      <p className="text-sm font-medium text-slate-700 mb-2">
        Today: <span className="font-normal text-slate-600">{data.message}.</span>
      </p>

      {factors.length > 0 && (
        <div className="mt-2">
          {factors.map(([key, factor]) => (
            <FactorRow
              key={key}
              label={factor.label}
              status={factor.status}
              detail={buildFactorDetail(key, factor, training_load, recovery)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
