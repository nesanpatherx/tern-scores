'use client'

import { useState } from 'react'
import {
  METRIC_POINTS,
  METRIC_LABELS,
  METRIC_HELP,
  BENCHMARKS,
  TOTAL_POINTS,
  type MetricKey,
} from '@/lib/score'

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#8a8a88',
  lightGrey: '#d9d9d9',
  hairline: '#ececea',
  offWhite: '#f7f4f0',
}

const ORDER: MetricKey[] = ['authority', 'traffic', 'keywords', 'referringDomains', 'backlinks']

// Traffic and keywords use a log scale; the rest are linear. Kept in sync with score.ts.
const SCALE: Record<MetricKey, 'log' | 'linear'> = {
  authority: 'linear',
  traffic: 'log',
  keywords: 'log',
  referringDomains: 'linear',
  backlinks: 'linear',
}

export default function MethodologyNote() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-6 mb-10">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
        style={{ color: C.charcoal }}
      >
        <span style={{ fontSize: 8 }}>{open ? '▼' : '▶'}</span>
        How the score is calculated
      </button>

      {open && (
        <div className="mt-3" style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[620px]">
              <thead>
                <tr style={{ background: C.offWhite, borderBottom: `1px solid ${C.lightGrey}` }}>
                  {['Metric', 'Weight', 'Full marks at', 'Scale', 'What it measures'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap ${i === 1 || i === 2 ? 'text-right' : 'text-left'}`}
                      style={{ color: C.darkGrey }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDER.map((k, i) => (
                  <tr key={k} style={{ borderTop: i > 0 ? `1px solid ${C.hairline}` : 'none' }}>
                    <td className="px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap" style={{ color: C.nearBlack }}>
                      {METRIC_LABELS[k]}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono tabular-nums text-right" style={{ color: C.orange }}>
                      {METRIC_POINTS[k]}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono tabular-nums text-right whitespace-nowrap" style={{ color: C.charcoal }}>
                      {BENCHMARKS[k].toLocaleString('en-GB')}
                    </td>
                    <td className="px-4 py-2.5 text-[11px]" style={{ color: C.darkGrey }}>
                      {SCALE[k]}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] leading-snug" style={{ color: C.darkGrey }}>
                      {METRIC_HELP[k]}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: `1px solid ${C.lightGrey}`, background: C.offWhite }}>
                  <td className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.charcoal }}>
                    Total
                  </td>
                  <td className="px-4 py-2.5 text-[12px] font-mono font-bold tabular-nums text-right" style={{ color: C.nearBlack }}>
                    {TOTAL_POINTS}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3.5 text-[11px] leading-relaxed space-y-2" style={{ borderTop: `1px solid ${C.lightGrey}`, color: C.darkGrey }}>
            <p>
              <strong style={{ color: C.charcoal }}>Scores are absolute, not a ranking curve.</strong>{' '}
              Each metric is measured against the fixed benchmark above, so a company&apos;s score only
              moves when its own performance moves — improving does not depend on another company
              slipping. Reaching every benchmark scores 100.
            </p>
            <p>
              <strong style={{ color: C.charcoal }}>Traffic and keywords use a log scale.</strong>{' '}
              Organic traffic across the portfolio spans four orders of magnitude. On a linear scale
              every company outside the top one or two would compress into the bottom few points, which
              tells you nothing. A log scale keeps the mid-range meaningfully separated, so early
              progress on a small site still registers.
            </p>
            <p>
              <strong style={{ color: C.charcoal }}>Bands.</strong> 70+ Strong · 45–69 Developing ·
              under 45 Needs work.
            </p>
            <p>
              <strong style={{ color: C.charcoal }}>Source and freshness.</strong> All figures come
              from the SEMrush API — Domain Overview for traffic and keywords, Backlinks Overview for
              authority score and links. Organic figures are taken from whichever of the UK or US
              database reports more traffic for that domain, since several UK businesses index
              primarily in the US dataset. SEMrush recalculates these roughly monthly; this page
              refreshes once a day.
            </p>
            <p>
              A score of zero on traffic means SEMrush estimates under one visit per month from
              organic search — it is a real result, not missing data. Newly launched domains will
              score low until SEMrush has indexed them, which takes a few weeks.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
