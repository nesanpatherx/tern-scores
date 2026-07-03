'use client'

import { useState } from 'react'

export default function PipedriveRefreshButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<{ name: string; status: string; mqls?: number; sqls?: number; pipeline?: number }[]>([])

  const refresh = async () => {
    setState('loading')
    try {
      const res = await fetch('/api/pipedrive-refresh', { method: 'POST' })
      const data = await res.json()
      if (data.results) {
        setResults(data.results)
        setState('done')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={refresh}
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
        {state === 'idle' && 'Refresh Pipedrive'}
        {state === 'loading' && 'Fetching…'}
        {state === 'done' && '✓ Done'}
        {state === 'error' && 'Error — retry'}
      </button>

      {state === 'done' && results.length > 0 && (
        <div
          className="absolute right-0 top-9 z-50 p-3 text-xs space-y-1 min-w-[220px]"
          style={{ background: '#f7f4f0', border: '1px solid #d9d9d9', color: '#4a4a48' }}
        >
          {results.map(r => (
            <div key={r.name} className="flex justify-between gap-4">
              <span style={{ color: '#999999' }}>{r.name}</span>
              <span style={{ color: r.status === 'ok' ? '#22c55e' : '#eb5c32' }}>
                {r.status === 'ok' ? `${r.mqls} open · £${(r.pipeline ?? 0).toLocaleString()}` : r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
