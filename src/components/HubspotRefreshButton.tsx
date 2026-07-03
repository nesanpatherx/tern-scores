'use client'

import { useState } from 'react'

type StageRow = { label: string; count: number; totalAmount: number }

export default function HubspotRefreshButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [summary, setSummary] = useState('')
  const [stages, setStages] = useState<StageRow[]>([])
  const [note, setNote] = useState('')

  const handleRefresh = async () => {
    setState('loading')
    setSummary('')
    setStages([])
    setNote('')

    try {
      const res = await fetch('/api/hubspot-refresh', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setSummary(data.error ?? 'Unknown error')
        return
      }

      setState('done')
      setSummary(
        `${data.deals_found} deals · MQLs: ${data.mqls} · SQLs: ${data.sqls} · Pipeline: £${Number(data.pipeline_arr).toLocaleString()}`
      )
      setStages(data.stage_breakdown ?? [])
      if (data.note) setNote(data.note)

      setTimeout(() => window.location.reload(), 2500)
    } catch (e) {
      setState('error')
      setSummary(String(e))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleRefresh}
        disabled={state === 'loading'}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
        style={{
          background: state === 'done' ? '#22c55e' : '#1a1a18',
          color: '#ffffff',
          border: '1px solid transparent',
        }}
      >
        {state === 'loading' && (
          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {state === 'idle' && 'Refresh HubSpot'}
        {state === 'loading' && 'Fetching…'}
        {state === 'done' && '✓ Done'}
        {state === 'error' && 'Error — retry'}
      </button>

      {summary && (
        <div
          className="absolute right-0 top-9 z-50 text-xs px-3 py-2 min-w-[260px] max-w-sm"
          style={{
            background: state === 'error' ? '#fff8f5' : '#f7f4f0',
            color: state === 'error' ? '#eb5c32' : '#4a4a48',
            border: '1px solid #d9d9d9',
          }}
        >
          {summary}
          {note && <p className="mt-1" style={{ color: '#999' }}>{note}</p>}
          {stages.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold mb-1" style={{ color: '#999' }}>Stage breakdown:</div>
              <ul className="space-y-0.5">
                {stages.map(s => (
                  <li key={s.label} className="flex justify-between gap-4">
                    <span>{s.label}</span>
                    <span className="font-mono">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
