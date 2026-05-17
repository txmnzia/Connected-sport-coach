function PaceBlock({ label, pace, hrRange, description, accent }) {
  return (
    <div className={`rounded-xl p-4 border ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <p className="text-4xl font-bold text-slate-800 mb-0.5">{pace}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-400">per km</span>
        {hrRange && (
          <span className="text-xs text-slate-400">· ~{hrRange[0]}–{hrRange[1]} bpm</span>
        )}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default function SpeedPotentialCard({ data }) {
  if (!data || data.comfortable_pace === 'N/A') return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">How fast can I run a 5K today?</p>
      <p className="text-sm text-slate-500">
        Not enough data yet — need at least a few runs longer than 4km to calculate this.
      </p>
    </div>
  )

  const readiness = data.readiness_pct ?? 100
  const readinessNote = readiness >= 98
    ? 'You are at full readiness today.'
    : readiness >= 95
    ? `You are at ${readiness}% readiness — very close to your best.`
    : `You are at ${readiness}% readiness — slightly below your peak due to training load or recovery.`

  const zones = data.hr_zones

  const comfortableDesc = zones?.z3
    ? `Zone 3 effort — the pace your body settles into at a sustained aerobic tempo. Breathing is elevated but you can still speak in short sentences. Derived from your actual Zone 3 runs.`
    : `An aerobic effort — breathing elevated but you could still speak in full sentences. This pace builds fitness with minimal injury risk.`

  const maxDesc = zones?.z4
    ? `Zone 4 threshold effort — hard but sustainable for 20–30 minutes. You can only manage a few words. Adjusted ${readiness < 100 ? `to ${readiness}% readiness` : 'for today'} based on your recovery.`
    : `Your ceiling given today's readiness. Pushing beyond this risks overextending yourself. Expect 1–2 recovery days if you run at this pace.`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        How fast can I run a 5K today?
      </p>

      <p className="text-sm text-slate-600 leading-relaxed mb-5">
        Your fastest recent pace over runs longer than 4km is{' '}
        <span className="font-semibold text-slate-800">{data.best_pace}/km</span>.{' '}
        {readinessNote} Here is what you can aim for today:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PaceBlock
          label="Comfortable target"
          pace={data.comfortable_pace}
          hrRange={zones?.z3}
          description={comfortableDesc}
          accent="border-blue-100 bg-blue-50"
        />
        <PaceBlock
          label="Your maximum today"
          pace={data.max_pace}
          hrRange={zones?.z4}
          description={maxDesc}
          accent="border-slate-200 bg-slate-50"
        />
      </div>

      <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
        {zones
          ? `Zones based on your estimated max HR of ${zones.max_hr} bpm · Zone 3: ${zones.z3[0]}–${zones.z3[1]} bpm · Zone 4: ${zones.z4[0]}–${zones.z4[1]} bpm`
          : `Your all-out 5K ceiling — based on recent training data — is around ${data.best_pace}/km. Maximum today is adjusted downward based on current recovery.`
        }
      </p>
    </div>
  )
}
