'use client'

import { useState } from 'react'
import { H, LATEST_MONTH, TOP_KEYWORDS, SEARCH_MARKET, SEARCH_MARKET_NOTE } from '@/lib/data'
import { METRICS, PILLARS, scoreBand, type MetricKey, type PillarKey, type Scored } from '@/lib/score'
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

const COLUMNS: { key: MetricKey; short: string }[] = [
  { key: 'traffic', short: 'Traffic' },
  { key: 'keywords', short: 'Keywords' },
  { key: 'top3', short: 'Top 3' },
  { key: 'aiOverview', short: 'AI Overview' },
  { key: 'peopleAlsoAsk', short: 'Also Ask' },
  { key: 'authorityScore', short: 'Authority' },
  { key: 'referringDomains', short: 'Ref. domains' },
  { key: 'backlinks', short: 'Backlinks' },
]

/** Where each pillar's columns start, for the grouped header row. */
const PILLAR_SPANS: { pillar: PillarKey; span: number }[] = [
  { pillar: 'search', span: 3 },
  { pillar: 'ai', span: 2 },
  { pillar: 'authority', span: 3 },
]

function Delta({ from, to, pct }: { from: number | null; to: number | null; pct: number | null }) {
  const t = trend(from, to, pct)
  return <span style={{ color: TREND_COLOR[t.direction] }}>{t.text}</span>
}

function Row({ s, isLast }: { s: Scored; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  const band = scoreBand(s.total)
  const { record } = s

  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer transition-colors hover:bg-[#fbfaf8]"
        style={{ borderBottom: open || isLast ? 'none' : `1px solid ${C.hair}` }}
      >
        <td className="pl-4 pr-1 py-2.5">
          <span className="font-mono text-[10.5px] tabular-nums" style={{ color: C.line }}>
            {String(s.rank).padStart(2, '0')}
          </span>
        </td>

        <td className="px-2 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain=${record.domain}`}
              alt=""
              width={15}
              height={15}
              className="shrink-0 rounded"
              style={{ opacity: 0.85 }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[12.5px] font-semibold leading-tight truncate" style={{ color: C.ink }}>
                  {record.name}
                </span>
                {SEARCH_MARKET[record.domain] && (
                  <span
                    title={SEARCH_MARKET_NOTE[SEARCH_MARKET[record.domain] as 'thin' | 'none']}
                    className="text-[8px] font-semibold uppercase tracking-wide px-1 py-px rounded shrink-0"
                    style={{ background: '#f2ece7', color: C.muted }}
                  >
                    {SEARCH_MARKET[record.domain] === 'none' ? 'no search market' : 'thin market'}
                  </span>
                )}
              </div>
              <a
                href={`https://${record.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[10.5px] hover:underline truncate block"
                style={{ color: C.muted }}
              >
                {record.domain}
              </a>
            </div>
          </div>
        </td>

        <td className="px-3 py-2.5 w-[112px]">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: C.hair, minWidth: 38 }}>
              <div className="h-full rounded-full" style={{ width: `${s.total}%`, background: band.color }} />
            </div>
            <span className="font-mono text-[13px] font-bold tabular-nums w-[21px] text-right" style={{ color: band.color }}>
              {s.total}
            </span>
          </div>
        </td>

        {COLUMNS.map((c, i) => {
          const m = s.metrics[c.key]
          const dividerBefore = i === 0 || i === 3 || i === 5
          return (
            <td
              key={c.key}
              className="px-3 py-2.5 text-right font-mono text-[12px] tabular-nums"
              style={{ color: C.body, borderLeft: dividerBefore ? `1px solid ${C.hair}` : undefined }}
            >
              {compact(m.value)}
            </td>
          )
        })}

        <td className="px-3 py-2.5 text-right font-mono text-[11.5px] tabular-nums" style={{ borderLeft: `1px solid ${C.hair}` }}>
          <Delta from={s.baseline[H.traffic]} to={s.latest[H.traffic]} pct={s.trafficYtdPct} />
        </td>

        <td className="pr-4 pl-1 py-2.5 text-right">
          <span className="text-[8.5px]" style={{ color: C.line }}>{open ? '▲' : '▼'}</span>
        </td>
      </tr>

      {open && (
        <tr style={{ borderBottom: isLast ? 'none' : `1px solid ${C.hair}` }}>
          <td colSpan={COLUMNS.length + 5} className="px-4 pt-1 pb-4" style={{ background: '#fbfaf8' }}>
            {/* What the company actually ranks for — a score alone cannot answer this. */}
            {(TOP_KEYWORDS[record.domain]?.length ?? 0) > 0 && (
              <div className="mb-4 pb-3.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: C.body }}>
                  Top keywords driving this traffic
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {TOP_KEYWORDS[record.domain].map(k => (
                    <span key={k.keyword} className="text-[11px] whitespace-nowrap" style={{ color: C.muted }}>
                      <span style={{ color: C.ink }}>{k.keyword}</span>
                      {' · '}#{k.position}
                      {' · '}<span className="font-mono tabular-nums">{compact(k.traffic)}</span> visits
                    </span>
                  ))}
                </div>
              </div>
            )}

            {SEARCH_MARKET[record.domain] && (
              <div
                className="mb-4 px-3 py-2 text-[11px] leading-snug rounded"
                style={{ background: '#fff8f5', border: `1px solid ${C.line}`, color: C.body }}
              >
                <strong style={{ color: C.ink }}>Limited search market.</strong>{' '}
                {SEARCH_MARKET_NOTE[SEARCH_MARKET[record.domain] as 'thin' | 'none']}
              </div>
            )}

            <div className="grid gap-x-8 gap-y-4 md:grid-cols-3">
              {(Object.keys(PILLARS) as PillarKey[]).map(pk => (
                <div key={pk}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.body }}>
                      {PILLARS[pk].label}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums" style={{ color: C.ink }}>
                      {s.pillars[pk].earned.toFixed(1)}
                      <span style={{ color: C.line }}>/{s.pillars[pk].max}</span>
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.values(s.metrics).filter(m => m.pillar === pk).map(m => (
                      <div key={m.key} className="flex items-center gap-2">
                        <span className="text-[10.5px] w-[96px] shrink-0 truncate" style={{ color: C.muted }}>{m.label}</span>
                        <span className="font-mono text-[10.5px] tabular-nums w-[42px] text-right shrink-0" style={{ color: C.body }}>
                          {compact(m.value)}
                        </span>
                        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: C.hair, minWidth: 28 }}>
                          <div className="h-full rounded-full" style={{ width: `${(m.points / m.max) * 100}%`, background: C.orange }} />
                        </div>
                        <span className="font-mono text-[10px] tabular-nums w-[44px] text-right shrink-0" style={{ color: C.body }}>
                          {m.points.toFixed(1)}<span style={{ color: C.line }}>/{m.max}</span>
                        </span>
                        <span className="font-mono text-[10px] tabular-nums w-[44px] text-right shrink-0">
                          <Delta from={m.ytdFrom} to={m.ytdTo} pct={m.ytd} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[10.5px]" style={{ borderTop: `1px solid ${C.line}`, color: C.muted }}>
              <span>
                Total <span className="font-mono font-bold" style={{ color: C.ink }}>{s.total}/100</span>
              </span>
              <span>
                Year to date{' '}
                <span style={{ color: C.body }}>
                  {monthLabel(s.baseline[H.month])} → {monthLabel(s.latest[H.month])}
                </span>
              </span>
              <span>
                AI Overview{' '}
                <span className="font-mono" style={{ color: s.aiYtdDelta >= 0 ? C.up : C.down }}>
                  {s.baseline[H.aiOverview]} → {s.latest[H.aiOverview]}
                </span>
              </span>
              <span>
                SEMrush <span style={{ color: C.body }}>{record.database.toUpperCase()}</span> database
                {record.database === 'us' && ' — sells into the US, so UK figures would understate it'}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ScoresTable({ groups }: { groups: { group: string; rows: Scored[] }[] }) {
  return (
    <div className="space-y-3">
      {groups.map(g => <GroupSection key={g.group} group={g.group} rows={g.rows} />)}
    </div>
  )
}

function GroupSection({ group, rows }: { group: string; rows: Scored[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.total, 0) / rows.length) : 0
  const band = scoreBand(avg)

  return (
    <section className="rounded-lg overflow-hidden" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-4 py-2.5 flex items-center justify-between transition-opacity hover:opacity-90"
        style={{ background: C.ink }}
      >
        <span className="flex items-baseline gap-2.5">
          <span className="text-[12.5px] font-semibold" style={{ color: '#fff' }}>{group}</span>
          <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            {rows.length} {rows.length === 1 ? 'company' : 'companies'}
          </span>
        </span>
        <span className="flex items-center gap-3.5">
          <span className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            average <span className="font-mono font-bold" style={{ color: band.color }}>{avg}</span>
          </span>
          <span className="text-[8.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{collapsed ? '▶' : '▼'}</span>
        </span>
      </button>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr style={{ background: C.cream }}>
                <th colSpan={3} />
                {PILLAR_SPANS.map(({ pillar, span }) => (
                  <th
                    key={pillar}
                    colSpan={span}
                    className="px-3 py-1.5 text-center text-[8.5px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: C.body, borderLeft: `1px solid ${C.line}` }}
                  >
                    {PILLARS[pillar].label} · {PILLARS[pillar].points}pts
                    <span className="normal-case tracking-normal font-normal" style={{ color: C.muted }}>
                      {' '}({monthLabel(LATEST_MONTH)})
                    </span>
                  </th>
                ))}
                <th colSpan={2} className="px-3 py-1.5 text-center text-[8.5px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: C.body, borderLeft: `1px solid ${C.line}` }}>
                  Traffic YTD
                </th>
              </tr>
              <tr style={{ background: C.cream, borderBottom: `1px solid ${C.line}` }}>
                <th className="pl-4 pr-1 py-2 text-left text-[8.5px] font-semibold uppercase tracking-[0.1em] w-[32px]" style={{ color: C.muted }}>#</th>
                <th className="px-2 py-2 text-left text-[8.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.muted }}>Company</th>
                <th className="px-3 py-2 text-left text-[8.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.ink }}>Score</th>
                {COLUMNS.map((c, i) => (
                  <th
                    key={c.key}
                    title={`${METRICS[c.key].label} — ${METRICS[c.key].points}pts, full marks at ${METRICS[c.key].benchmark.toLocaleString('en-GB')}`}
                    className="px-3 py-2 text-right text-[8.5px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap"
                    style={{ color: C.muted, borderLeft: (i === 0 || i === 3 || i === 5) ? `1px solid ${C.hair}` : undefined }}
                  >
                    {c.short}
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-[8.5px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap"
                  style={{ color: C.muted, borderLeft: `1px solid ${C.hair}` }}>
                  Traffic
                </th>
                <th className="pr-4 pl-1 w-[22px]" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => <Row key={r.record.domain} s={r} isLast={i === rows.length - 1} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
