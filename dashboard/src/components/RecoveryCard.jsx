const HRV_STATUS_TEXT = {
  elevated:       { label: 'Above your norm', color: 'text-emerald-600' },
  normal:         { label: 'Normal',           color: 'text-emerald-600' },
  below_baseline: { label: 'Below your norm',  color: 'text-amber-600' },
  suppressed:     { label: 'Significantly low', color: 'text-red-600' },
  unknown:        { label: 'No data',          color: 'text-slate-400' },
}

function Metric({ title, value, status, statusColor, explanation }) {
  return (
    <div className="py-4 border-t border-slate-100 first:border-0 first:pt-0">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {status && <span className={`text-sm font-medium ${statusColor}`}>{status}</span>}
      </div>
      {value && <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>}
      {explanation && <p className="text-xs text-slate-500 leading-relaxed">{explanation}</p>}
    </div>
  )
}

export default function RecoveryCard({ data }) {
  if (!data) return null

  const hrv = HRV_STATUS_TEXT[data.hrv_status] ?? HRV_STATUS_TEXT.unknown

  const hrvExplanation = data.hrv_7day_avg && data.hrv_baseline
    ? `${data.hrv_7day_avg}ms — your 7-day average. Your personal baseline is ${data.hrv_baseline}ms. ` +
      (data.hrv_status === 'below_baseline' || data.hrv_status === 'suppressed'
        ? 'A lower-than-usual HRV means your nervous system is still processing recent training stress.'
        : data.hrv_status === 'elevated'
        ? 'Above your baseline is a positive sign — your body has recovered well.'
        : 'Within your normal range — recovery is on track.')
    : 'Heart Rate Variability measures how well your nervous system has recovered from training. Higher is better.'

  const batteryExplanation = data.body_battery != null
    ? `${data.body_battery}% — Garmin's estimate of your energy reserves, calculated from overnight heart rate patterns. Above 70% is considered good.`
    : null

  const rhrExplanation = data.resting_hr && data.resting_hr_baseline
    ? (() => {
        const pct = Math.round((data.resting_hr / data.resting_hr_baseline - 1) * 100)
        const base = `${data.resting_hr} bpm — your baseline is ${data.resting_hr_baseline} bpm. `
        return pct <= 2
          ? base + 'Normal. An elevated resting HR (5% or more above your baseline) would signal incomplete recovery.'
          : base + `${pct}% above your baseline — a sign your body is under stress or recovering from hard training.`
      })()
    : 'Your resting heart rate while at complete rest. Rising above your baseline by 5%+ is a recovery warning sign.'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Your recovery today</p>

      <Metric
        title="Heart Rate Variability (HRV)"
        status={hrv.label}
        statusColor={hrv.color}
        explanation={hrvExplanation}
      />

      {data.body_battery != null && (
        <Metric
          title="Body Battery"
          value={`${data.body_battery}%`}
          status={data.body_battery >= 70 ? 'Good' : data.body_battery >= 40 ? 'Moderate' : 'Low'}
          statusColor={data.body_battery >= 70 ? 'text-emerald-600' : data.body_battery >= 40 ? 'text-amber-600' : 'text-red-600'}
          explanation={batteryExplanation}
        />
      )}

      {data.resting_hr != null && (
        <Metric
          title="Resting Heart Rate"
          status={data.resting_hr_baseline && data.resting_hr / data.resting_hr_baseline > 1.05 ? 'Elevated' : 'Normal'}
          statusColor={data.resting_hr_baseline && data.resting_hr / data.resting_hr_baseline > 1.05 ? 'text-amber-600' : 'text-emerald-600'}
          explanation={rhrExplanation}
        />
      )}
    </div>
  )
}
