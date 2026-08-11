'use client'

import { useState } from 'react'
import { METRICS, METRIC_HELP, PILLARS, TOTAL_POINTS, type MetricKey, type PillarKey } from '@/lib/score'
import { LATEST_MONTH, BASELINE_MONTH } from '@/lib/data'
import { monthLabel } from '@/lib/format'

const C = {
  orange: '#eb5c32',
  ink: '#1a1a18',
  body: '#4a4a48',
  muted: '#8a8a88',
  line: '#e4e4e1',
  hair: '#f0efec',
  cream: '#f7f4f0',
}

export default function MethodologyNote() {
  const [open, setOpen] = useState(false)
  const keys = Object.keys(METRICS) as MetricKey[]

  return (
    <div className="mt-7 mb-10">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] transition-opacity hover:opacity-70"
        style={{ color: C.body }}
      >
        <span style={{ fontSize: 8 }}>{open ? '▼' : '▶'}</span>
        How the score works
      </button>

      {open && (
        <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[680px]">
              <thead>
                <tr style={{ background: C.cream, borderBottom: `1px solid ${C.line}` }}>
                  {['Pillar', 'Metric', 'Points', 'Full marks at', 'Scale', 'What it measures'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-2 text-[8.5px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap ${i === 2 || i === 3 ? 'text-right' : 'text-left'}`}
                      style={{ color: C.muted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => {
                  const m = METRICS[k]
                  const firstOfPillar = i === 0 || METRICS[keys[i - 1]].pillar !== m.pillar
                  return (
                    <tr key={k} style={{ borderTop: firstOfPillar && i > 0 ? `1px solid ${C.line}` : i > 0 ? `1px solid ${C.hair}` : 'none' }}>
                      <td className="px-4 py-2 text-[10.5px] font-semibold whitespace-nowrap" style={{ color: firstOfPillar ? C.orange : 'transparent' }}>
                        {firstOfPillar ? `${PILLARS[m.pillar as PillarKey].label} · ${PILLARS[m.pillar as PillarKey].points}` : '·'}
                      </td>
                      <td className="px-4 py-2 text-[11.5px] font-semibold whitespace-nowrap" style={{ color: C.ink }}>{m.label}</td>
                      <td className="px-4 py-2 text-[11.5px] font-mono tabular-nums text-right" style={{ color: C.body }}>{m.points}</td>
                      <td className="px-4 py-2 text-[11.5px] font-mono tabular-nums text-right whitespace-nowrap" style={{ color: C.body }}>
                        {m.benchmark.toLocaleString('en-GB')}
                      </td>
                      <td className="px-4 py-2 text-[10.5px]" style={{ color: C.muted }}>{m.scale}</td>
                      <td className="px-4 py-2 text-[10.5px] leading-snug" style={{ color: C.muted }}>{METRIC_HELP[k]}</td>
                    </tr>
                  )
                })}
                <tr style={{ borderTop: `1px solid ${C.line}`, background: C.cream }}>
                  <td className="px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.body }}>Total</td>
                  <td />
                  <td className="px-4 py-2 text-[11.5px] font-mono font-bold tabular-nums text-right" style={{ color: C.ink }}>{TOTAL_POINTS}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3.5 text-[10.5px] leading-relaxed space-y-2" style={{ borderTop: `1px solid ${C.line}`, color: C.muted }}>
            <p>
              <strong style={{ color: C.body }}>Why AI visibility is scored separately.</strong> Google now
              answers many queries inside an AI Overview rather than sending a click. A site can hold its
              rankings and still lose traffic if it is not being cited in those answers, so AI Overview and
              People Also Ask presence are measured as their own pillar rather than folded into search.
            </p>
            <p>
              <strong style={{ color: C.body }}>Scores are absolute, not a ranking curve.</strong> Each
              metric is measured against the fixed benchmark above, so a company&apos;s score moves only when
              its own performance moves — improving never depends on another company slipping.
            </p>
            <p>
              <strong style={{ color: C.body }}>Traffic and keywords use a log scale.</strong> Organic traffic
              across the portfolio spans four orders of magnitude. On a linear scale every company outside the
              largest one or two would compress into the bottom few points, which tells you nothing. A log
              scale keeps the mid-range separated so early progress on a smaller site still registers.
            </p>
            <p>
              <strong style={{ color: C.body }}>Year to date</strong> compares{' '}
              {monthLabel(BASELINE_MONTH)} with {monthLabel(LATEST_MONTH)}. Link metrics are a current
              snapshot, so they carry no YTD figure.
            </p>
            <p>
              <strong style={{ color: C.body }}>Source.</strong> SEMrush UK database for every company —
              Domain Overview history for search and AI figures, Backlinks Overview for authority and links.
              SEMrush recalculates monthly, and {monthLabel(LATEST_MONTH)} is the latest complete month.
              Bands: 60+ Strong · 35–59 Developing · under 35 Needs work. A zero is a real result, not
              missing data.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
