import ScoreCards from '@/components/ScoreCards'
import ScoresTable from '@/components/ScoresTable'
import AiVisibility from '@/components/AiVisibility'
import MethodologyNote from '@/components/MethodologyNote'
import { PORTFOLIO, DATA_AS_OF, DATA_VERIFIED, MEASUREMENT_START, LATEST_MONTH, H } from '@/lib/data'
import { GROUP_ORDER } from '@/lib/portcos'
import { scorePortfolio, scoreBand } from '@/lib/score'
import { compact, signedPct, monthLabel } from '@/lib/format'

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

function Kpi({
  value, label, sub, color, delta,
}: {
  value: string | number
  label: string
  sub?: string
  color?: string
  delta?: { text: string; positive: boolean }
}) {
  return (
    <div className="px-4 py-3.5 rounded-lg" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
      <div className="flex items-baseline gap-2">
        <span className="text-[27px] font-bold leading-none tabular-nums tracking-tight" style={{ color: color ?? C.ink }}>
          {value}
        </span>
        {delta && (
          <span className="text-[11px] font-mono font-semibold tabular-nums" style={{ color: delta.positive ? C.up : C.down }}>
            {delta.text}
          </span>
        )}
      </div>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.11em] mt-2.5" style={{ color: C.muted }}>
        {label}
      </div>
      {sub && <div className="text-[10.5px] mt-0.5 truncate" style={{ color: C.muted }}>{sub}</div>}
    </div>
  )
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mt-7 mb-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.13em]" style={{ color: C.body }}>{title}</h2>
      {hint && <span className="text-[10.5px] hidden sm:inline" style={{ color: C.muted }}>{hint}</span>}
    </div>
  )
}

export default function Page() {
  const scored = scorePortfolio(PORTFOLIO)

  const avg = Math.round(scored.reduce((s, r) => s + r.total, 0) / scored.length)
  const leader = scored[0]

  // Portfolio totals, summed rather than averaged, so one large site does not hide the rest.
  const latestTraffic = scored.reduce((s, r) => s + r.latest[H.traffic], 0)
  const baseTraffic = scored.reduce((s, r) => s + r.baseline[H.traffic], 0)
  const trafficPct = baseTraffic > 0 ? ((latestTraffic - baseTraffic) / baseTraffic) * 100 : null

  const latestAi = scored.reduce((s, r) => s + r.latest[H.aiOverview], 0)
  const baseAi = scored.reduce((s, r) => s + r.baseline[H.aiOverview], 0)
  const aiPct = baseAi > 0 ? ((latestAi - baseAi) / baseAi) * 100 : null

  // The same totals measured from the month work actually began.
  const measuredTraffic = scored.reduce((s, r) => s + r.measured[H.traffic], 0)
  const measuredAi = scored.reduce((s, r) => s + r.measured[H.aiOverview], 0)
  const trafficSincePct = measuredTraffic > 0 ? ((latestTraffic - measuredTraffic) / measuredTraffic) * 100 : null
  const aiSincePct = measuredAi > 0 ? ((latestAi - measuredAi) / measuredAi) * 100 : null
  const sincePeriod = `${monthLabel(MEASUREMENT_START)} → ${monthLabel(scored[0].latest[H.month])}`

  // Growth from a zero base has no percentage but is still growth, so it counts here.
  const growing = scored.filter(r => {
    const from = r.baseline[H.traffic]
    const to = r.latest[H.traffic]
    return (from === 0 && to > 0) || (r.trafficYtdPct ?? 0) > 5
  }).length
  const declining = scored.filter(r => (r.trafficYtdPct ?? 0) < -5).length

  const period = `${monthLabel(scored[0].baseline[H.month])} → ${monthLabel(scored[0].latest[H.month])}`

  const groups = GROUP_ORDER.map(group => ({
    group,
    rows: scored.filter(r => r.record.group === group),
  })).filter(g => g.rows.length > 0)

  const asOf = new Date(DATA_AS_OF).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const verified = new Date(DATA_VERIFIED).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <header
        className="px-5 sm:px-6 flex items-center justify-between h-14 sticky top-0 z-20"
        style={{ background: C.ink, borderBottom: `2px solid ${C.orange}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[15px] leading-none select-none shrink-0">
            <span style={{ color: C.orange, fontWeight: 600 }}>Tern</span>
            <span style={{ color: '#fff', fontWeight: 300 }}>Capital</span>
          </span>
          <span
            className="text-[11px] hidden sm:inline truncate"
            style={{ color: C.muted, borderLeft: `1px solid ${C.body}`, paddingLeft: 12 }}
          >
            Search &amp; AI Visibility Index
          </span>
        </div>
        <span className="text-[10.5px] shrink-0" style={{ color: C.muted }}>
          {PORTFOLIO.length} companies · SEMrush {monthLabel(LATEST_MONTH)} · verified {verified}
        </span>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-[1540px] mx-auto">
        <div className="mb-5 max-w-[740px]">
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="text-[9.5px] font-semibold uppercase tracking-[0.11em] px-2 py-1 rounded"
              style={{ background: C.orange, color: '#fff' }}
            >
              Year to date · {period}
            </span>
            <span className="text-[10.5px]" style={{ color: C.muted }}>
              2026 performance so far
            </span>
          </div>
          <h1 className="text-[20px] font-semibold leading-snug tracking-tight" style={{ color: C.ink }}>
            How the portfolio is performing in search and AI answers
          </h1>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: C.body }}>
            <strong style={{ color: C.ink }}>This is year-to-date data for 2026 — {period}.</strong>{' '}
            Every company is scored out of 100 across three pillars: classic search, visibility inside
            AI answers, and domain authority. Every percentage change measures movement since the start
            of the year, not month on month.
          </p>
          <p className="text-[12px] mt-2 leading-relaxed" style={{ color: C.muted }}>
            <strong style={{ color: C.body }}>What the numbers are.</strong> Current figures are
            SEMrush&apos;s {monthLabel(LATEST_MONTH)} monthly reading — the last complete month it has
            published — captured {asOf} and re-checked against the SEMrush API on {verified}, when{' '}
            {monthLabel(LATEST_MONTH)} was still the newest month available. They are not a partial
            August count. Traffic means{' '}
            <strong style={{ color: C.body }}>estimated visits from unpaid Google results only</strong>;
            direct, email, referral and paid visitors are not included, so a zero here does not mean a
            site had no visitors. Measured on the SEMrush UK database except where a row says otherwise.
          </p>
        </div>

        <div
          className="mb-5 px-4 py-3 rounded-lg text-[12px] leading-relaxed max-w-[860px]"
          style={{ background: '#fff', border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.orange}` }}
        >
          <strong style={{ color: C.ink }}>Reading the year-to-date numbers.</strong>{' '}
          Active measurement and optimisation began in {monthLabel(MEASUREMENT_START)}. The first
          quarter of 2026 therefore predates that work, and a good part of the full-year decline sits
          in those months. Since {sincePeriod}, portfolio organic traffic is{' '}
          <strong style={{ color: (trafficSincePct ?? 0) >= 0 ? C.up : C.down }}>
            {trafficSincePct !== null ? signedPct(trafficSincePct) : 'flat'}
          </strong>{' '}
          and AI Overview citations are{' '}
          <strong style={{ color: (aiSincePct ?? 0) >= 0 ? C.up : C.down }}>
            {aiSincePct !== null ? signedPct(aiSincePct) : 'flat'}
          </strong>
          . Both are shown throughout: <em>YTD</em> is the full-year picture, <em>since {monthLabel(MEASUREMENT_START)}</em> is
          the period the work covers.
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi value={avg} label="Portfolio average" sub="out of 100" color={scoreBand(avg).color} />
          <Kpi
            value={compact(latestTraffic)}
            label="Monthly organic search visits"
            sub={trafficSincePct !== null ? `${signedPct(trafficSincePct)} since ${monthLabel(MEASUREMENT_START)}` : 'portfolio total'}
            delta={trafficPct !== null ? { text: signedPct(trafficPct), positive: trafficPct >= 0 } : undefined}
          />
          <Kpi
            value={compact(latestAi)}
            label="AI Overview results"
            sub={aiSincePct !== null ? `${signedPct(aiSincePct)} since ${monthLabel(MEASUREMENT_START)}` : 'portfolio total'}
            color={C.orange}
            delta={aiPct !== null ? { text: signedPct(aiPct), positive: aiPct >= 0 } : undefined}
          />
          <Kpi value={leader.total} label="Highest score" sub={leader.record.name} />
          <Kpi
            value={`${growing} / ${declining}`}
            label="Growing vs declining"
            sub={`organic traffic, ${period}`}
          />
        </div>

        <SectionHeading title="Ranked — all 15 companies" hint="Hover a card for its biggest gains available" />
        <ScoreCards scored={scored} />

        <SectionHeading title="AI visibility" hint={`Google AI Overview citations, ${period}`} />
        <AiVisibility scored={scored} />

        <SectionHeading title="Full metrics by group" hint="Click a row for the pillar breakdown and YTD movement" />
        <ScoresTable groups={groups} />

        <MethodologyNote />
      </main>
    </div>
  )
}
