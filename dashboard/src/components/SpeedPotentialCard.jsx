function PaceBlock({ label, pace, description, accent }) {
  return (
    <div className={`rounded-xl p-4 border ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <p className="text-4xl font-bold text-slate-800 mb-1">{pace}</p>
      <p className="text-xs text-slate-500">per km</p>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{description}</p>
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
          description="An aerobic effort — breathing elevated but you could still speak in full sentences. This pace builds fitness with minimal injury risk."
          accent="border-blue-100 bg-blue-50"
        />
        <PaceBlock
          label="Your maximum today"
          pace={data.max_pace}
          description="Your ceiling given today's readiness. Pushing beyond this risks overextending yourself. Expect 1–2 recovery days if you run at this pace."
          accent="border-slate-200 bg-slate-50"
        />
      </div>

      {data.best_pace && (
        <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
          Your all-out 5K ceiling — based on recent training data — is around {data.best_pace}/km.
          Your maximum today is adjusted downward based on current recovery.
        </p>
      )}
    </div>
  )
}
