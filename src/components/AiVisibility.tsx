import { H } from '@/lib/data'
import type { Scored } from '@/lib/score'
import { compact, monthLabel, trend, TREND_COLOR } from '@/lib/format'

const C = {
  orange: '#eb5c32',
  ink: '#1a1a18',
  body: '#4a4a48',
  muted: '#8a8a88',
  line: '#e4e4e1',
  hair: '#f0efec',
  cream: '#f7f4f0',
  up: '#16a34a',
  down: '#dc2626',
}

/** Portfolio-wide AI Overview results per month, so the trend is visible at a glance. */
function PortfolioTrend({ scored }: { scored: Scored[] }) {
  const months = scored[0].history.map(r => r[H.month])
  const totals = months.map((_, i) => scored.reduce((sum, s) => sum + (s.history[i]?.[H.aiOverview] ?? 0), 0))
  const max = Math.max(...totals, 1)

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 96 }}>
        {totals.map((v, i) => {
          const isLast = i === totals.length - 1
          return (
            <div key={months[i]} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{ color: isLast ? C.ink : C.muted, fontWeight: isLast ? 700 : 400 }}
              >
                {v}
              </span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${Math.max((v / max) * 100, 2)}%`,
                  background: isLast ? C.orange : '#f0d5cb',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {months.map((m, i) => (
          <span
            key={m}
            className="flex-1 text-center text-[9px] whitespace-nowrap"
            style={{ color: i === months.length - 1 ? C.body : C.muted }}
          >
            {monthLabel(m)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AiVisibility({ scored }: { scored: Scored[] }) {
  const latestTotal = scored.reduce((s, r) => s + r.latest[H.aiOverview], 0)
  const baseTotal = scored.reduce((s, r) => s + r.baseline[H.aiOverview], 0)
  const pct = baseTotal > 0 ? ((latestTotal - baseTotal) / baseTotal) * 100 : null
  const portfolioTrend = trend(baseTotal, latestTotal, pct)

  const cited = scored.filter(r => r.latest[H.aiOverview] > 0).length
  const absent = scored.filter(r => r.latest[H.aiOverview] === 0).length

  const byAi = [...scored].sort((a, b) => b.latest[H.aiOverview] - a.latest[H.aiOverview])
  const maxAi = Math.max(...byAi.map(r => r.latest[H.aiOverview]), 1)

  const gainers = [...scored].sort((a, b) => b.aiYtdDelta - a.aiYtdDelta).slice(0, 3).filter(r => r.aiYtdDelta > 0)
  const losers = [...scored].sort((a, b) => a.aiYtdDelta - b.aiYtdDelta).slice(0, 3).filter(r => r.aiYtdDelta < 0)

  const period = `${monthLabel(scored[0].baseline[H.month])} → ${monthLabel(scored[0].latest[H.month])}`

  return (
    <section className="rounded-lg overflow-hidden" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
      <div className="px-5 py-4" style={{ background: C.ink }}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold" style={{ color: '#fff' }}>AI visibility</h2>
            <p className="text-[11px] mt-1 max-w-[620px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              How often each company is cited inside Google&apos;s AI Overview — the answer box that
              increasingly replaces the click. A site can hold its rankings and still lose traffic if it
              is not being quoted here.
            </p>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-bold tabular-nums text-[30px] leading-none tracking-tight" style={{ color: '#fff' }}>
              {latestTotal}
            </span>
            <span className="font-mono text-[12px] font-semibold tabular-nums" style={{ color: TREND_COLOR[portfolioTrend.direction] }}>
              {portfolioTrend.text}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              results, {period}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px]">
        {/* Ranked bars */}
        <div className="p-5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: C.muted }}>
            AI Overview results by company
          </div>
          <div className="space-y-1.5">
            {byAi.map(s => {
              const v = s.latest[H.aiOverview]
              const t = trend(s.baseline[H.aiOverview], v, null)
              const delta = s.aiYtdDelta
              return (
                <div key={s.record.domain} className="flex items-center gap-2.5">
                  <span className="text-[11px] w-[132px] shrink-0 truncate" style={{ color: v > 0 ? C.ink : C.muted }}>
                    {s.record.name}
                  </span>
                  <div className="flex-1 h-[14px] rounded-sm overflow-hidden" style={{ background: C.hair, minWidth: 60 }}>
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${Math.max((v / maxAi) * 100, v > 0 ? 1.5 : 0)}%`, background: C.orange }}
                    />
                  </div>
                  <span className="font-mono text-[11.5px] tabular-nums w-[34px] text-right shrink-0" style={{ color: C.ink }}>
                    {v}
                  </span>
                  <span
                    className="font-mono text-[10.5px] tabular-nums w-[42px] text-right shrink-0"
                    style={{ color: delta === 0 ? C.muted : delta > 0 ? C.up : C.down }}
                  >
                    {delta === 0 ? (t.text === 'new' ? 'new' : '—') : `${delta > 0 ? '+' : ''}${delta}`}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] mt-3" style={{ color: C.muted }}>
            Bar shows current AI Overview results. Final column is the change since{' '}
            {monthLabel(scored[0].baseline[H.month])}.
          </p>
        </div>

        {/* Side panel */}
        <div className="p-5 space-y-5" style={{ borderLeft: `1px solid ${C.line}`, background: '#fbfaf8' }}>
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: C.muted }}>
              Portfolio trend
            </div>
            <PortfolioTrend scored={scored} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[22px] font-bold tabular-nums leading-none" style={{ color: C.ink }}>{cited}</div>
              <div className="text-[9.5px] mt-1.5 leading-tight" style={{ color: C.muted }}>cited in AI answers</div>
            </div>
            <div>
              <div className="text-[22px] font-bold tabular-nums leading-none" style={{ color: absent > 0 ? C.down : C.ink }}>{absent}</div>
              <div className="text-[9.5px] mt-1.5 leading-tight" style={{ color: C.muted }}>absent entirely</div>
            </div>
          </div>

          {gainers.length > 0 && (
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: C.muted }}>
                Biggest gains
              </div>
              <ul className="space-y-1">
                {gainers.map(g => (
                  <li key={g.record.domain} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="truncate" style={{ color: C.body }}>{g.record.name}</span>
                    <span className="font-mono tabular-nums shrink-0" style={{ color: C.up }}>+{g.aiYtdDelta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {losers.length > 0 && (
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: C.muted }}>
                Biggest losses
              </div>
              <ul className="space-y-1">
                {losers.map(g => (
                  <li key={g.record.domain} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="truncate" style={{ color: C.body }}>{g.record.name}</span>
                    <span className="font-mono tabular-nums shrink-0" style={{ color: C.down }}>{g.aiYtdDelta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
