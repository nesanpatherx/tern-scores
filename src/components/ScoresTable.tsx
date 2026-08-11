'use client'

import { useState } from 'react'
import {
  METRIC_POINTS,
  METRIC_SHORT,
  METRIC_LABELS,
  BENCHMARKS,
  scoreBand,
  type MetricKey,
  type ScoreBreakdown,
} from '@/lib/score'
import type { SemrushMetrics } from '@/lib/semrush'
import type { Portco } from '@/lib/portcos'

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#8a8a88',
  lightGrey: '#d9d9d9',
  hairline: '#ececea',
  offWhite: '#f7f4f0',
}

export type ScoredPortco = {
  portco: Portco
  metrics: SemrushMetrics
  score: ScoreBreakdown
  rank: number
}

const METRIC_ORDER: MetricKey[] = ['authority', 'traffic', 'keywords', 'referringDomains', 'backlinks']

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function ScorePill({ score }: { score: number }) {
  const band = scoreBand(score)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: C.hairline, minWidth: 44 }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: band.color }} />
      </div>
      <span className="font-mono text-[13px] font-bold tabular-nums w-[22px] text-right" style={{ color: band.color }}>
        {score}
      </span>
    </div>
  )
}

function MetricBar({ label, points, max, value }: { label: string; points: number; max: number; value: number }) {
  const share = max > 0 ? (points / max) * 100 : 0
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[104px] shrink-0 text-[11px]" style={{ color: C.darkGrey }}>{label}</span>
      <span className="w-[52px] shrink-0 font-mono text-[11px] tabular-nums text-right" style={{ color: C.charcoal }}>
        {fmt(value)}
      </span>
      <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: C.hairline, minWidth: 40 }}>
        <div className="h-full rounded-full" style={{ width: `${share}%`, background: C.orange }} />
      </div>
      <span className="w-[46px] shrink-0 font-mono text-[11px] tabular-nums text-right" style={{ color: C.charcoal }}>
        {points.toFixed(1)}<span style={{ color: C.lightGrey }}>/{max}</span>
      </span>
    </div>
  )
}

function Row({ entry, isLast }: { entry: ScoredPortco; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  const { portco, metrics, score, rank } = entry
  const band = scoreBand(score.total)

  return (
    <>
      <tr
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer transition-colors hover:bg-[#fbfaf8]"
        style={{ borderBottom: open || isLast ? 'none' : `1px solid ${C.hairline}` }}
      >
        <td className="pl-4 pr-1 py-[11px] align-middle">
          <span className="font-mono text-[11px] tabular-nums" style={{ color: C.lightGrey }}>
            {String(rank).padStart(2, '0')}
          </span>
        </td>
        <td className="px-2 py-[11px] align-middle">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain=${portco.domain}`}
              alt=""
              width={16}
              height={16}
              className="shrink-0 rounded-sm"
              style={{ opacity: 0.85 }}
            />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold leading-tight truncate" style={{ color: C.nearBlack }}>
                {portco.name}
              </div>
              <a
                href={`https://${portco.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[11px] hover:underline truncate block"
                style={{ color: C.darkGrey }}
              >
                {portco.domain}
              </a>
            </div>
          </div>
        </td>

        <td className="px-3 py-[11px] align-middle w-[132px]">
          <ScorePill score={score.total} />
        </td>

        <td className="px-3 py-[11px] align-middle w-[96px]">
          <span className="text-[11px] font-semibold" style={{ color: band.color }}>{band.label}</span>
        </td>

        {METRIC_ORDER.map(k => (
          <td
            key={k}
            className="px-3 py-[11px] text-right font-mono text-[12px] tabular-nums align-middle"
            style={{ color: C.charcoal }}
          >
            {metrics.error ? <span style={{ color: C.lightGrey }}>·</span> : fmt(score.parts[k].value)}
          </td>
        ))}

        <td className="pr-4 pl-1 py-[11px] text-right align-middle">
          <span className="text-[9px]" style={{ color: C.lightGrey }}>{open ? '▲' : '▼'}</span>
        </td>
      </tr>

      {open && (
        <tr style={{ borderBottom: isLast ? 'none' : `1px solid ${C.hairline}` }}>
          <td colSpan={9} className="px-4 pb-4 pt-1" style={{ background: '#fbfaf8' }}>
            <div className="grid gap-x-10 gap-y-2 md:grid-cols-2 max-w-[900px]">
              {METRIC_ORDER.map(k => (
                <MetricBar
                  key={k}
                  label={METRIC_LABELS[k]}
                  points={score.parts[k].points}
                  max={score.parts[k].max}
                  value={score.parts[k].value}
                />
              ))}
            </div>
            <div className="mt-3 pt-2.5 text-[11px] flex flex-wrap gap-x-4 gap-y-1" style={{ borderTop: `1px solid ${C.hairline}`, color: C.darkGrey }}>
              <span>
                Total <span className="font-mono font-bold" style={{ color: C.nearBlack }}>{score.total}/100</span>
              </span>
              <span>SEMrush <span style={{ color: C.charcoal }}>{metrics.database.toUpperCase()}</span> database</span>
              {metrics.error && <span style={{ color: C.orange }}>Lookup failed: {metrics.error}</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Head() {
  return (
    <thead>
      <tr style={{ background: C.offWhite, borderBottom: `1px solid ${C.lightGrey}` }}>
        <th className="pl-4 pr-1 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.08em] w-[34px]" style={{ color: C.darkGrey }}>
          #
        </th>
        <th className="px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.darkGrey }}>
          Company
        </th>
        <th className="px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.charcoal }}>
          Score / 100
        </th>
        <th className="px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.darkGrey }}>
          Band
        </th>
        {METRIC_ORDER.map(k => (
          <th
            key={k}
            title={`${METRIC_LABELS[k]} — ${METRIC_POINTS[k]}pts, full marks at ${BENCHMARKS[k].toLocaleString()}`}
            className="px-3 py-2 text-right text-[9px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
            style={{ color: C.darkGrey }}
          >
            {METRIC_SHORT[k]}
          </th>
        ))}
        <th className="pr-4 pl-1 w-[24px]" style={{ background: C.offWhite }} />
      </tr>
    </thead>
  )
}

function GroupSection({ group, rows }: { group: string; rows: ScoredPortco[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score.total, 0) / rows.length) : 0
  const band = scoreBand(avg)

  return (
    <section style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-4 py-3 flex items-center justify-between transition-opacity hover:opacity-90"
        style={{ background: C.nearBlack }}
      >
        <span className="flex items-baseline gap-2.5">
          <span className="text-[13px] font-semibold" style={{ color: '#ffffff' }}>{group}</span>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {rows.length} {rows.length === 1 ? 'company' : 'companies'}
          </span>
        </span>
        <span className="flex items-center gap-3.5">
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            group average{' '}
            <span className="font-mono font-bold" style={{ color: band.color }}>{avg}</span>
          </span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{collapsed ? '▶' : '▼'}</span>
        </span>
      </button>

      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]">
            <Head />
            <tbody>
              {rows.map((r, i) => (
                <Row key={r.portco.domain} entry={r} isLast={i === rows.length - 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function ScoresTable({
  groups,
}: {
  groups: { group: string; rows: ScoredPortco[] }[]
}) {
  return (
    <div className="space-y-4">
      {groups.map(g => (
        <GroupSection key={g.group} group={g.group} rows={g.rows} />
      ))}
    </div>
  )
}
