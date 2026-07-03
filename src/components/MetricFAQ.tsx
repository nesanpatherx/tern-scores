'use client'

import { useState } from 'react'

const C = {
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#999999',
  lightGrey: '#d9d9d9',
  offWhite: '#f7f4f0',
}

const GROUPS = [
  {
    label: 'SEMrush',
    metrics: [
      { n: '1', label: 'Authority Score', def: 'SEMrush 0–100 score for domain strength. Higher is better.' },
      { n: '2', label: 'Organic Traffic', def: 'Estimated monthly visitors from search (not paid). Falls back to GSC clicks if SEMrush shows 0.' },
      { n: '3', label: 'Organic Keywords', def: 'Number of search terms the site ranks for in Google.' },
      { n: '4', label: 'Backlinks', def: 'External websites linking to this domain.' },
    ],
  },
  {
    label: 'Search Console',
    metrics: [
      { n: '5', label: 'Clicks', def: 'People who clicked through to the site from Google Search.' },
      { n: '6', label: 'Impressions', def: 'Times the site appeared in Google results, clicked or not.' },
      { n: '7', label: 'CTR', def: 'Percentage of search appearances that led to a click.' },
      { n: '8', label: 'Avg Position', def: 'Average Google ranking. Lower is better — 1 means top result.' },
    ],
  },
  {
    label: 'Google Analytics',
    metrics: [
      { n: '9', label: 'Users', def: 'Unique visitors to the site in the period.' },
      { n: '10', label: 'Sessions', def: 'Total visits. One user can have multiple sessions.' },
      { n: '11', label: 'Views', def: 'Total pages viewed across all sessions.' },
      { n: '12', label: 'Time on Site', def: 'Average time per visit. Longer = stronger engagement.' },
      { n: '13', label: 'Bounce Rate', def: 'Visitors who left without any interaction. Lower is better.' },
    ],
  },
  {
    label: 'Sales Funnel',
    metrics: [
      { n: '14', label: 'MQLs', def: 'Marketing Qualified Leads — prospects showing early buying interest.' },
      { n: '15', label: 'SQLs', def: 'Sales Qualified Leads — prospects actively pursued by sales.' },
      { n: '16', label: 'Pipeline ARR', def: 'Total annual revenue value of all open deals.' },
      { n: '17', label: 'Avg Deal Value', def: 'Average annual revenue per open deal.' },
    ],
  },
]

export default function MetricFAQ() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-8 mb-10">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest mb-3 transition-opacity hover:opacity-70"
        style={{ color: C.charcoal }}
      >
        <span style={{ fontSize: '8px' }}>{open ? '▼' : '▶'}</span>
        Metric definitions
      </button>

      {open && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {GROUPS.map(group => (
            <div key={group.label} style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
              <div
                className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-widest"
                style={{ background: C.offWhite, borderBottom: `1px solid ${C.lightGrey}`, color: C.charcoal }}
              >
                {group.label}
              </div>
              <div>
                {group.metrics.map((m, i) => (
                  <div
                    key={m.n}
                    className="px-4 py-2.5"
                    style={{ borderTop: i > 0 ? `1px solid ${C.lightGrey}` : 'none' }}
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[9px] font-mono shrink-0 w-4 text-right" style={{ color: C.darkGrey }}>{m.n}</span>
                      <span className="text-[12px] font-semibold leading-tight" style={{ color: C.nearBlack }}>{m.label}</span>
                    </div>
                    <p className="text-[11px] leading-snug pl-6" style={{ color: C.darkGrey }}>{m.def}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
