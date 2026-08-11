'use client'

import { useState } from 'react'
import { improvementAreas, scoreBand } from '@/lib/score'
import type { ScoredPortco } from './ScoresTable'

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#8a8a88',
  lightGrey: '#d9d9d9',
  hairline: '#ececea',
  offWhite: '#f7f4f0',
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/** Circular score gauge. Stroke is drawn as a fraction of the circumference. */
function Gauge({ score, color }: { score: number; color: string }) {
  const r = 26
  const circumference = 2 * Math.PI * r
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: 62, height: 62 }}>
      <svg width={62} height={62} viewBox="0 0 62 62" className="-rotate-90">
        <circle cx={31} cy={31} r={r} fill="none" stroke={C.hairline} strokeWidth={5} />
        <circle
          cx={31}
          cy={31}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: 'stroke-dasharray 400ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold tabular-nums leading-none text-[19px]" style={{ color: C.nearBlack }}>
          {score}
        </span>
      </div>
    </div>
  )
}

function Card({ entry }: { entry: ScoredPortco }) {
  // Hover drives the reveal on pointer devices; tapping pins it open on touch, where
  // there is no hover state at all.
  const [pinned, setPinned] = useState(false)
  const { portco, metrics, score, rank } = entry
  const band = scoreBand(score.total)
  const areas = improvementAreas(score, 3)
  const unavailable = !!metrics.error

  return (
    <div
      onClick={() => setPinned(p => !p)}
      className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_6px_20px_-8px_rgba(26,26,24,0.22)] hover:-translate-y-px"
      style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}`, minHeight: 132 }}
    >
      {/* Band accent along the top edge */}
      <div style={{ height: 3, background: unavailable ? C.lightGrey : band.color }} />

      <div className="px-4 pt-3.5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain=${portco.domain}`}
              alt=""
              width={16}
              height={16}
              className="shrink-0 rounded-sm"
              style={{ opacity: 0.85 }}
            />
            <span className="text-[12.5px] font-semibold leading-tight truncate" style={{ color: C.nearBlack }}>
              {portco.name}
            </span>
          </div>
          <span className="font-mono text-[10px] tabular-nums shrink-0 pt-0.5" style={{ color: C.lightGrey }}>
            {String(rank).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Gauge score={score.total} color={unavailable ? C.lightGrey : band.color} />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold leading-tight" style={{ color: unavailable ? C.darkGrey : band.color }}>
              {unavailable ? 'No data' : band.label}
            </div>
            <div className="text-[10.5px] mt-1 leading-tight" style={{ color: C.darkGrey }}>
              {unavailable ? 'Lookup failed' : <>{compact(metrics.organicTraffic)} monthly visits</>}
            </div>
            <div className="text-[10.5px] leading-tight" style={{ color: C.darkGrey }}>
              {unavailable ? ' ' : <>{compact(metrics.organicKeywords)} keywords</>}
            </div>
          </div>
        </div>
      </div>

      {/* Improvement areas — slides up over the card on hover, or pinned by tap */}
      <div
        className={`absolute inset-x-0 bottom-0 top-[3px] px-4 py-3.5 flex flex-col transition-transform duration-200 ease-out ${
          pinned ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
        }`}
        style={{ background: C.nearBlack }}
        aria-hidden={!pinned}
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {unavailable ? 'Unavailable' : 'Biggest gains available'}
        </div>

        {unavailable ? (
          <p className="text-[10.5px] leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {metrics.error}
          </p>
        ) : areas.length === 0 ? (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Every benchmark met.
          </p>
        ) : (
          <ul className="space-y-2">
            {areas.map(a => (
              <li key={a.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10.5px] font-medium truncate" style={{ color: '#ffffff' }}>
                    {a.label}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums shrink-0" style={{ color: C.orange }}>
                    +{a.gap.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
                  <div className="h-full rounded-full" style={{ width: `${a.earned * 100}%`, background: C.orange }} />
                </div>
                <div className="text-[9.5px] mt-0.5 font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
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

export default function ScoreCards({ entries }: { entries: ScoredPortco[] }) {
  return (
    <div className="grid gap-px xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 grid-cols-2" style={{ background: C.lightGrey }}>
      {entries.map(e => (
        <Card key={e.portco.domain} entry={e} />
      ))}
    </div>
  )
}
