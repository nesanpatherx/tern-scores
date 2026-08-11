'use client'

import { useState } from 'react'
import { H } from '@/lib/data'
import { improvementAreas, scoreBand, PILLARS, type PillarKey, type Scored } from '@/lib/score'
import { compact, trend, TREND_COLOR } from '@/lib/format'

const C = {
  orange: '#eb5c32',
  ink: '#1a1a18',
  body: '#4a4a48',
  muted: '#8a8a88',
  line: '#e4e4e1',
  hair: '#f0efec',
  cream: '#f7f4f0',
}

const PILLAR_KEYS: PillarKey[] = ['search', 'ai', 'authority']

/** Traffic trend for the year, drawn as a filled area. Flat line when there is no traffic. */
function Sparkline({ history, color }: { history: Scored['history']; color: string }) {
  const w = 100
  const h = 22
  const values = history.map(r => r[H.traffic])
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? w / (values.length - 1) : w

  const pts = values.map((v, i) => [i * step, h - (v / max) * (h - 2) - 1] as const)
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={color} opacity={0.1} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2} fill={color} />
    </svg>
  )
}

function Card({ s }: { s: Scored }) {
  // Hover drives the reveal on pointer devices; tapping pins it, since touch has no hover.
  const [pinned, setPinned] = useState(false)
  const band = scoreBand(s.total)
  const areas = improvementAreas(s, 3)
  const { record } = s

  return (
    <div
      onClick={() => setPinned(p => !p)}
      className="group relative overflow-hidden cursor-pointer rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_rgba(26,26,24,0.28)]"
      style={{ background: '#fff', border: `1px solid ${C.line}` }}
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
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
            <span className="text-[12.5px] font-semibold leading-tight truncate" style={{ color: C.ink }}>
              {record.name}
            </span>
          </div>
          <span className="font-mono text-[10px] tabular-nums shrink-0 pt-px" style={{ color: C.line }}>
            {String(s.rank).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-end gap-2 mb-1">
          <span className="font-bold tabular-nums leading-none text-[34px] tracking-tight" style={{ color: C.ink }}>
            {s.total}
          </span>
          <span className="text-[11px] font-semibold leading-none pb-1.5" style={{ color: band.color }}>
            {band.label}
          </span>
        </div>

        <div className="mb-2.5">
          <Sparkline history={s.history} color={band.color} />
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[10px]" style={{ color: C.muted }}>
              {compact(s.latest[H.traffic])} visits/mo
            </span>
            {(() => {
              const t = trend(s.baseline[H.traffic], s.latest[H.traffic], s.trafficYtdPct)
              return (
                <span className="text-[10px] font-mono tabular-nums" style={{ color: TREND_COLOR[t.direction] }}>
                  {t.text}
                </span>
              )
            })()}
          </div>
        </div>

        <div className="flex gap-1">
          {PILLAR_KEYS.map(k => {
            const p = s.pillars[k]
            return (
              <div key={k} className="flex-1" title={`${PILLARS[k].label} ${p.earned.toFixed(0)}/${p.max}`}>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: C.hair }}>
                  <div className="h-full rounded-full" style={{ width: `${(p.earned / p.max) * 100}%`, background: band.color }} />
                </div>
                <div className="text-[8.5px] mt-1 uppercase tracking-wide truncate" style={{ color: C.muted }}>
                  {k === 'authority' ? 'Auth' : PILLARS[k].label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Improvement areas — slides up on hover, or pinned by tap */}
      <div
        className={`absolute inset-0 p-3.5 flex flex-col transition-transform duration-200 ease-out ${
          pinned ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
        }`}
        style={{ background: C.ink }}
        aria-hidden={!pinned}
      >
        <div className="text-[8.5px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
          Biggest gains available
        </div>
        {areas.length === 0 ? (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Every benchmark met.</p>
        ) : (
          <ul className="space-y-2.5">
            {areas.map(a => (
              <li key={a.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10.5px] font-medium truncate" style={{ color: '#fff' }}>{a.label}</span>
                  <span className="font-mono text-[10px] tabular-nums shrink-0" style={{ color: C.orange }}>
                    +{(a.max - a.points).toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(a.points / a.max) * 100}%`, background: C.orange }} />
                </div>
                <div className="text-[9px] mt-0.5 font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  {compact(a.value)} → {compact(a.benchmark)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function ScoreCards({ scored }: { scored: Scored[] }) {
  return (
    <div className="grid gap-3 xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 grid-cols-2">
      {scored.map(s => <Card key={s.record.domain} s={s} />)}
    </div>
  )
}
