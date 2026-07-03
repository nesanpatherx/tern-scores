import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const HUBSPOT_KEY = process.env.HUBSPOT_KEY_NMETROFY
const NMETROFY_NAME = 'Metrofy'

// Comma-separated stage internal names/IDs that count as MQL and SQL.
// Set HUBSPOT_MQL_STAGES and HUBSPOT_SQL_STAGES in Vercel once you know the stage names.
// Until set, MQL/SQL counts will be 0 but pipeline ARR and avg deal value will still populate.
const MQL_STAGES = (process.env.HUBSPOT_MQL_STAGES ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
const SQL_STAGES = (process.env.HUBSPOT_SQL_STAGES ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

type Deal = {
  id: string
  properties: {
    dealstage: string
    amount: string | null
    closedate: string | null
  }
}

type Stage = {
  id: string
  label: string
  displayOrder: number
}

async function hubspotGet(path: string) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    headers: { Authorization: `Bearer ${HUBSPOT_KEY}`, 'Content-Type': 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`HubSpot ${path} → ${res.status}`)
  return res.json()
}

async function fetchAllDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  let after: string | undefined

  do {
    const params = new URLSearchParams({
      properties: 'dealstage,amount,closedate',
      limit: '100',
      archived: 'false',
      ...(after ? { after } : {}),
    })
    const data = await hubspotGet(`/crm/v3/objects/deals?${params}`)
    deals.push(...(data.results ?? []))
    after = data.paging?.next?.after
  } while (after)

  return deals
}

async function fetchStageMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  try {
    const data = await hubspotGet('/crm/v3/pipelines/deals')
    for (const pipeline of data.results ?? []) {
      for (const stage of (pipeline.stages ?? []) as Stage[]) {
        map.set(stage.id, stage.label)
      }
    }
  } catch {
    // Non-fatal — stage labels will fall back to raw IDs
  }
  return map
}

export async function POST() {
  if (!HUBSPOT_KEY) {
    return NextResponse.json({ error: 'HUBSPOT_KEY_NMETROFY not configured' }, { status: 500 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const sb = createClient(url, key)

  // Find Nmetrofy portco
  const { data: portco } = await sb
    .from('portcos')
    .select('id, name')
    .ilike('name', `%${NMETROFY_NAME}%`)
    .single()

  if (!portco) {
    return NextResponse.json({ error: `Could not find portco matching "${NMETROFY_NAME}"` }, { status: 404 })
  }

  try {
    const [deals, stageMap] = await Promise.all([fetchAllDeals(), fetchStageMap()])

    // Build stage breakdown (for diagnostic output)
    const stageCounts: Record<string, { label: string; count: number; totalAmount: number }> = {}
    for (const deal of deals) {
      const stageId = deal.properties.dealstage ?? 'unknown'
      const label = stageMap.get(stageId) ?? stageId
      if (!stageCounts[stageId]) stageCounts[stageId] = { label, count: 0, totalAmount: 0 }
      stageCounts[stageId].count++
      stageCounts[stageId].totalAmount += parseFloat(deal.properties.amount ?? '0') || 0
    }

    // Tally MQLs, SQLs, pipeline ARR
    let mqls = 0
    let sqls = 0
    let pipelineArr = 0
    let dealCount = 0

    for (const deal of deals) {
      const stageId = deal.properties.dealstage ?? ''
      const stageLabel = (stageMap.get(stageId) ?? stageId).toLowerCase()
      const amount = parseFloat(deal.properties.amount ?? '0') || 0

      const isMql = MQL_STAGES.length > 0 && (MQL_STAGES.includes(stageId.toLowerCase()) || MQL_STAGES.includes(stageLabel))
      const isSql = SQL_STAGES.length > 0 && (SQL_STAGES.includes(stageId.toLowerCase()) || SQL_STAGES.includes(stageLabel))

      if (isMql) mqls++
      if (isSql) sqls++

      // Count all open deals for pipeline ARR
      pipelineArr += amount
      if (amount > 0) dealCount++
    }

    const avgDealValue = dealCount > 0 ? Math.round(pipelineArr / dealCount) : 0

    const today = new Date().toISOString().split('T')[0]
    const payload = {
      portco_id: portco.id,
      period_start: today,
      period_end: today,
      mqls,
      sqls,
      pipeline_arr: Math.round(pipelineArr),
      avg_deal_value: avgDealValue,
    }

    await sb.from('funnel_uploads').delete().eq('portco_id', portco.id)
    const { error } = await sb.from('funnel_uploads').insert(payload)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      portco: portco.name,
      deals_found: deals.length,
      mqls,
      sqls,
      pipeline_arr: Math.round(pipelineArr),
      avg_deal_value: avgDealValue,
      stage_breakdown: Object.values(stageCounts).sort((a, b) => b.count - a.count),
      note: MQL_STAGES.length === 0
        ? 'MQL/SQL counts are 0 — set HUBSPOT_MQL_STAGES and HUBSPOT_SQL_STAGES in Vercel to map deal stages'
        : undefined,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
