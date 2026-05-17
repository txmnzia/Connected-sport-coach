function EffortRow({ label, km, description, color }) {
  return (
    <div className="flex items-start justify-between py-3 border-t border-slate-100 gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-2xl font-bold ${color}`}>{km}</span>
        <span className="text-slate-400 text-sm"> km</span>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export default function MaxDistanceCard({ data }) {
  if (!data) return null

  const hasData = data.basis_km != null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        How far can I safely run?
      </p>

      {hasData ? (
        <>
          <p className="text-sm text-slate-600 leading-relaxed mb-1">
            Your longest run in the past 28 days was{' '}
            <span className="font-semibold text-slate-800">{data.basis_km}km</span>
            {data.basis_date && <> on {formatDate(data.basis_date)}</>}.
            Based on how recovered you are today, here is what is safe:
          </p>

          <div className="mt-1">
            <EffortRow
              label="Easy, conversational pace"
              description="You could hold a full conversation throughout — low injury risk"
              km={data.easy_km}
              color="text-emerald-600"
            />
            <EffortRow
              label="Comfortable, working effort"
              description="Breathing harder, short sentences only — moderate demand"
              km={data.moderate_km}
              color="text-amber-600"
            />
            <EffortRow
              label="Hard push or race pace"
              description="Maximum effort — expect 1–2 recovery days after"
              km={data.hard_km}
              color="text-orange-600"
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Going further than these limits when your body is under training stress significantly
            increases the risk of overuse injuries.
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Not enough data yet — complete a few more runs and check back.
        </p>
      )}
    </div>
  )
}
