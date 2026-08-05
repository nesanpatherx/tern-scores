'use client'

import { useState } from 'react'
import { fmtNum, fmtPct, fmtPos, fmtDate, fmtDuration } from '@/lib/format'
import type { PortcoDB, SCUpload, GAUpload, SEMUpload } from '@/lib/supabase'
import { METRIC_POINTS, SOURCE_WEIGHTS, type ScoreBreakdown } from '@/lib/score'

const C = {
  orange: '#eb5c32',
  nearBlack: '#1a1a18',
  charcoal: '#4a4a48',
  darkGrey: '#999999',
  lightGrey: '#d9d9d9',
  offWhite: '#f7f4f0',
}

type ScoredRow = {
  portco: PortcoDB
  sc: SCUpload | null
  ga: GAUpload | null
  sem: SEMUpload | null
  score: ScoreBreakdown
}

type Group = { group: string; rows: ScoredRow[] }

type MetricItem = { name: string; pts: number; max: number; excluded?: boolean }
type MetricGroup = { label: string; present: boolean; weight: number; items: MetricItem[] }

function Dash() {
  return (
    <span title="No data" style={{ color: C.lightGrey, display: 'inline-flex', alignItems: 'center' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        <line x1="4" y1="4" x2="20" y2="20"/>
      </svg>
    </span>
  )
}

function ScoreBar({ score, coverage }: { score: number; coverage: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: C.lightGrey, minWidth: 48 }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono font-bold w-6 text-right" style={{ color }}>{score}</span>
      {coverage < 100 && (
        <span
          title={`Scored on ${coverage}% of sources — missing data is excluded rather than penalised`}
          className="text-[9px] font-mono px-1 shrink-0"
          style={{ color: C.darkGrey, border: `1px solid ${C.lightGrey}`, borderRadius: 2 }}
        >
          {coverage}%
        </span>
      )}
    </div>
  )
}

function Cell({ children, className = '', divider = false, style }: {
  children: React.ReactNode; className?: string; divider?: boolean; style?: React.CSSProperties
}) {
  return (
    <td
      className={`px-2 py-2 text-right text-[11px] whitespace-nowrap font-mono ${className}`}
      style={{ ...(divider ? { borderLeft: `1px solid ${C.lightGrey}` } : {}), ...style }}
    >
      {children}
    </td>
  )
}

function ColHead({ children, divider = false }: { children: React.ReactNode; divider?: boolean }) {
  return (
    <th
      className="px-2 py-2 text-right text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={{ color: C.darkGrey, borderLeft: divider ? `1px solid ${C.lightGrey}` : undefined }}
    >
      {children}
    </th>
  )
}

function ctrColor(ctr?: number) {
  if (!ctr) return ''
  if (ctr >= 0.05) return 'text-green-600'
  if (ctr >= 0.02) return 'text-amber-500'
  return 'text-red-500'
}
function positionColor(pos?: number) {
  if (!pos) return ''
  if (pos <= 10) return 'text-green-600'
  if (pos <= 30) return 'text-amber-500'
  return 'text-red-500'
}

function CompanyRow({ portco, sc, ga, sem, score }: ScoredRow) {
  const [expanded, setExpanded] = useState(false)
  const rowLastUpdated = [sc?.uploaded_at, ga?.uploaded_at, sem?.uploaded_at].filter(Boolean).sort().pop()

  return (
    <>
      <tr
        className="group transition-colors hover:bg-[#faf9f7] cursor-pointer"
        style={{ borderBottom: `1px solid ${C.offWhite}` }}
        onClick={() => setExpanded(e => !e)}
      >
        <td
          className="px-3 py-2 sticky left-0 bg-white group-hover:bg-[#faf9f7] transition-colors w-[170px] min-w-[170px]"
          style={{ borderRight: `1px solid ${C.lightGrey}` }}
        >
          <div className="flex items-center gap-2">
            <img src={`https://www.google.com/s2/favicons?sz=32&domain=${portco.domain}`} alt="" className="w-3.5 h-3.5 shrink-0" style={{ opacity: 0.7 }} />
            <div className="min-w-0">
              <div className="font-semibold text-[12px] leading-tight truncate" style={{ color: C.nearBlack }}>{portco.name}</div>
              {rowLastUpdated && <div className="text-[10px]" style={{ color: C.lightGrey }}>{fmtDate(rowLastUpdated)}</div>}
            </div>
          </div>
        </td>
        <td className="px-3 py-2 w-[150px]" style={{ borderLeft: `1px solid ${C.lightGrey}` }}>
          <ScoreBar score={score.total} coverage={score.coverage} />
        </td>
        <Cell divider style={{ color: score.authority > 0 ? C.charcoal : undefined }}>{sem ? (sem.authority_score ?? 0) : <Dash />}</Cell>
        <Cell style={{ color: C.charcoal }}>
          {sem && sem.organic_traffic
            ? fmtNum(sem.organic_traffic)
            : sc?.clicks
            ? <span>{fmtNum(sc.clicks)}<sup style={{ fontSize: '7px', color: C.darkGrey, marginLeft: '1px' }}>GSC</sup></span>
            : sem ? 0 : <Dash />}
        </Cell>
        <Cell style={{ color: C.charcoal }}>{sem ? fmtNum(sem.organic_keywords) : <Dash />}</Cell>
        <Cell style={{ color: C.charcoal }}>{sem ? fmtNum(sem.backlinks) : <Dash />}</Cell>
        <Cell divider style={{ color: C.charcoal }}>{sc ? fmtNum(sc.clicks) : <Dash />}</Cell>
        <Cell className={ctrColor(sc?.ctr)}>{sc ? fmtPct(sc.ctr) : <Dash />}</Cell>
        <Cell className={positionColor(sc?.avg_position)}>{sc ? fmtPos(sc.avg_position) : <Dash />}</Cell>
        <Cell divider style={{ color: C.charcoal }}>{ga ? fmtNum(ga.users) : <Dash />}</Cell>
        <Cell style={{ color: C.charcoal }}>{ga ? fmtDuration(ga.avg_session_duration) : <Dash />}</Cell>
        <Cell style={{ color: C.charcoal }}>{ga ? fmtPct(ga.bounce_rate) : <Dash />}</Cell>
        <td className="px-2 py-2 text-[10px]" style={{ color: C.darkGrey }}>{expanded ? '▲' : '▼'}</td>
      </tr>
      {expanded && (
        <tr style={{ background: '#fafaf9', borderBottom: `1px solid ${C.lightGrey}` }}>
          <td colSpan={13} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-6 text-[11px]">
              {([
                { label: 'SEMrush', present: !!sem, weight: SOURCE_WEIGHTS.sem, items: [
                  { name: 'Authority', pts: score.authority, max: METRIC_POINTS.authority },
                  { name: 'Traffic', pts: score.traffic, max: METRIC_POINTS.traffic },
                  { name: 'Keywords', pts: score.keywords, max: METRIC_POINTS.keywords },
                  { name: 'Backlinks', pts: score.backlinks, max: METRIC_POINTS.backlinks },
                ]},
                { label: 'Search Console', present: !!sc, weight: SOURCE_WEIGHTS.sc, items: [
                  { name: 'Clicks', pts: score.clicks, max: METRIC_POINTS.clicks },
                  { name: 'CTR', pts: score.ctr, max: METRIC_POINTS.ctr },
                  { name: 'Position', pts: score.position, max: METRIC_POINTS.position },
                ]},
                { label: 'GA4', present: !!ga, weight: SOURCE_WEIGHTS.ga, items: [
                  { name: 'Users', pts: score.users, max: METRIC_POINTS.users, excluded: score.usersExcluded },
                  { name: 'Bounce rate', pts: score.bounce, max: METRIC_POINTS.bounce },
                  { name: 'Time on site', pts: score.timeOnSite, max: METRIC_POINTS.timeOnSite },
                ]},
              ] as MetricGroup[]).map(group => {
                const dropped = group.items.reduce((s, i) => s + (i.excluded ? i.max : 0), 0)
                return (
                <div key={group.label} style={{ opacity: group.present ? 1 : 0.45 }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-semibold" style={{ color: C.charcoal }}>{group.label}</span>
                    <span className="text-[10px]" style={{ color: C.darkGrey }}>
                      {!group.present
                        ? 'no data — excluded'
                        : dropped > 0
                        ? `${group.weight - dropped} of ${group.weight}pts`
                        : `${group.weight}pts`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <div key={item.name} className="flex items-center gap-2" style={{ opacity: item.excluded ? 0.4 : 1 }}>
                        <span className="w-20 shrink-0" style={{ color: C.darkGrey }}>{item.name}</span>
                        <div className="flex-1 h-1 rounded-full" style={{ background: C.lightGrey }}>
                          {!item.excluded && (
                            <div className="h-1 rounded-full" style={{ width: `${(item.pts / item.max) * 100}%`, background: C.orange }} />
                          )}
                        </div>
                        <span className="font-mono w-8 text-right" style={{ color: C.charcoal }}>
                          {item.excluded ? 'excl.' : `${item.pts}/${item.max}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 text-[11px]" style={{ borderTop: `1px solid ${C.lightGrey}`, color: C.darkGrey }}>
              <span className="font-mono" style={{ color: C.charcoal }}>{score.raw}/{score.available}</span>
              {' '}points earned
              {score.coverage < 100 && <> · scored on <span style={{ color: C.charcoal }}>{score.coverage}%</span> of the full basis</>}
              {' → '}
              <span className="font-mono font-bold" style={{ color: C.charcoal }}>{score.total}/100</span>
              {score.excluded.length > 0 && (
                <span> · excluded: {score.excluded.join(', ')}</span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function GroupTable({ group, rows }: Group) {
  const [collapsed, setCollapsed] = useState(false)
  const avgScore = rows.length ? Math.round(rows.reduce((s, r) => s + r.score.total, 0) / rows.length) : 0
  const scoreColor = avgScore >= 70 ? '#22c55e' : avgScore >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ background: '#ffffff', border: `1px solid ${C.lightGrey}` }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-4 py-2.5 flex items-center justify-between transition-colors hover:opacity-90"
        style={{ background: C.nearBlack, borderBottom: collapsed ? 'none' : `1px solid ${C.lightGrey}` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{group}</span>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{rows.length} companies</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono font-bold" style={{ color: scoreColor }}>avg {avgScore}/100</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{collapsed ? '▶' : '▼'}</span>
        </div>
      </button>
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.lightGrey}` }}>
                <th rowSpan={2} className="text-left px-3 py-2 text-[9px] font-semibold uppercase tracking-wider sticky left-0 z-10 w-[170px]"
                  style={{ background: C.offWhite, color: C.darkGrey, borderRight: `1px solid ${C.lightGrey}` }}>Company</th>
                <th rowSpan={2} className="px-3 py-2 text-[9px] font-semibold uppercase tracking-wider w-[150px]"
                  style={{ borderLeft: `1px solid ${C.lightGrey}`, background: C.offWhite, color: C.charcoal }}>Score /100</th>
                {[{ label: 'SEMrush', cols: 4 }, { label: 'Search Console', cols: 3 }, { label: 'GA4', cols: 3 }].map(g => (
                  <th key={g.label} colSpan={g.cols} className="py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider"
                    style={{ borderLeft: `1px solid ${C.lightGrey}`, background: C.offWhite, color: C.charcoal }}>{g.label}</th>
                ))}
                <th rowSpan={2} style={{ background: C.offWhite, width: 24 }} />
              </tr>
              <tr style={{ borderBottom: `2px solid ${C.nearBlack}`, background: C.offWhite }}>
                <ColHead divider>Auth</ColHead>
                <ColHead>Traffic</ColHead>
                <ColHead>KWs</ColHead>
                <ColHead>Links</ColHead>
                <ColHead divider>Clicks</ColHead>
                <ColHead>CTR</ColHead>
                <ColHead>Pos</ColHead>
                <ColHead divider>Users</ColHead>
                <ColHead>Time</ColHead>
                <ColHead>Bounce</ColHead>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => <CompanyRow key={r.portco.id} {...r} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ScoresTable({ groups }: { groups: Group[] }) {
  return (
    <div className="space-y-4">
      {groups.map(g => <GroupTable key={g.group} {...g} />)}
    </div>
  )
}
