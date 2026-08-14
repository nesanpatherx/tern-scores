import type { PortcoGroup } from './portcos'

/**
 * SEMrush snapshot for the Tern portfolio.
 *
 * Pulled from the SEMrush API on 11 August 2026. July 2026 is the latest complete
 * month SEMrush has published — it recalculates these figures monthly, so this is
 * the freshest data available rather than a stale cache.
 *
 * The AI Overview, People Also Ask and featured-snippet columns are only available
 * on SEMrush's newer reporting endpoint, which the public REST API this app could
 * call at build time does not expose. They are therefore captured here rather than
 * fetched live. Refresh by re-running the resource_rank_history report per domain
 * and replacing its history, plus backlinks_overview for the link figures.
 *
 * Domains are measured against the SEMrush **UK** database, with one deliberate
 * exception: StoreSpace Insights sells into the US, and its UK figures understate
 * it by roughly ten times. It is measured on the US database and flagged as such
 * in the UI rather than being made to look weak by the wrong yardstick.
 */
export const DATA_AS_OF = '2026-08-11'
export const LATEST_MONTH = '2026-07'
export const BASELINE_MONTH = '2026-01'

/**
 * Last date the figures were re-checked against the SEMrush API. On 14 Aug 2026 the
 * July reading was confirmed unchanged and July was still the newest month SEMrush
 * had published — it recalculates monthly, so there is nothing more recent to show.
 * Update this whenever the data is re-verified, even if no numbers move; it is the
 * difference between "current" and "nobody has looked".
 */
export const DATA_VERIFIED = '2026-08-14'

/**
 * The month active measurement and optimisation work began across the portfolio.
 * Movement before this point predates any of that work, so the page reports change
 * since this month alongside the full year-to-date figure — otherwise a Q1 decline
 * reads as a failure of work that had not started yet.
 */
export const MEASUREMENT_START = '2026-04'

/** Monthly row: [month, organicKeywords, organicTraffic, trafficCost, top3Positions, aiOverview, featuredSnippet, peopleAlsoAsk] */
export type HistoryRow = readonly [string, number, number, number, number, number, number, number]

export type PortcoRecord = {
  name: string
  domain: string
  group: PortcoGroup
  database: 'uk' | 'us'
  /** Current-snapshot link profile from SEMrush backlinks_overview. */
  authorityScore: number
  referringDomains: number
  backlinks: number
  /** Oldest month first. */
  history: readonly HistoryRow[]
}

export const PORTFOLIO: readonly PortcoRecord[] = [
  {
    name: 'Charity Log', domain: 'charitylog.co.uk', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 33, referringDomains: 298, backlinks: 1006,
    history: [
      ['2025-12', 820, 21593, 154016, 36, 218, 17, 409],
      ['2026-01', 1016, 21127, 83296, 38, 335, 18, 622],
      ['2026-02', 1100, 21851, 79477, 47, 394, 12, 721],
      ['2026-03', 886, 21297, 96993, 52, 298, 5, 471],
      ['2026-04', 816, 20774, 97782, 55, 265, 8, 226],
      ['2026-05', 693, 21156, 72864, 56, 214, 5, 323],
      ['2026-06', 523, 17604, 59581, 44, 108, 1, 345],
      ['2026-07', 489, 17801, 60470, 44, 180, 0, 352],
    ],
  },
  {
    name: 'Dizions', domain: 'dizions.co.uk', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 25, referringDomains: 409, backlinks: 3858,
    history: [
      ['2025-12', 221, 186, 1039, 1, 19, 1, 164],
      ['2026-01', 228, 227, 917, 1, 17, 0, 172],
      ['2026-02', 244, 208, 771, 1, 20, 0, 138],
      ['2026-03', 322, 295, 1488, 2, 20, 1, 114],
      ['2026-04', 336, 454, 2405, 2, 17, 0, 68],
      ['2026-05', 341, 431, 1819, 2, 20, 0, 181],
      ['2026-06', 384, 528, 1603, 6, 22, 0, 239],
      ['2026-07', 366, 424, 1384, 6, 87, 0, 224],
    ],
  },
  {
    name: 'Mind Of My Own', domain: 'mindofmyown.org.uk', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 28, referringDomains: 421, backlinks: 2312,
    history: [
      ['2025-12', 120, 1034, 159, 6, 55, 2, 71],
      ['2026-01', 126, 1054, 1004, 5, 67, 1, 89],
      ['2026-02', 159, 1306, 4877, 9, 71, 1, 135],
      ['2026-03', 120, 1264, 5552, 10, 48, 0, 96],
      ['2026-04', 61, 1665, 4745, 6, 17, 0, 26],
      ['2026-05', 62, 733, 1772, 6, 12, 0, 46],
      ['2026-06', 53, 618, 1798, 4, 12, 0, 39],
      ['2026-07', 55, 1079, 786, 4, 18, 0, 39],
    ],
  },
  {
    name: 'CCube Solutions', domain: 'ccube.cloud', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 7, referringDomains: 122, backlinks: 469,
    history: [
      ['2025-12', 0, 0, 0, 0, 0, 0, 0],
      ['2026-01', 0, 0, 0, 0, 0, 0, 0],
      ['2026-02', 0, 0, 0, 0, 0, 0, 0],
      ['2026-03', 0, 0, 0, 0, 0, 0, 0],
      ['2026-04', 1, 1, 0, 0, 0, 0, 1],
      ['2026-05', 2, 1, 0, 0, 0, 0, 2],
      ['2026-06', 2, 11, 0, 0, 0, 0, 1],
      ['2026-07', 3, 11, 0, 0, 0, 0, 2],
    ],
  },
  {
    name: 'SchoolScreener', domain: 'schoolscreener.com', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 17, referringDomains: 269, backlinks: 3412,
    history: [
      ['2025-12', 18, 4, 0, 0, 3, 0, 7],
      ['2026-01', 12, 0, 0, 0, 2, 0, 5],
      ['2026-02', 13, 0, 0, 0, 2, 0, 8],
      ['2026-03', 10, 0, 0, 0, 2, 0, 5],
      ['2026-04', 12, 101, 8, 1, 2, 0, 2],
      ['2026-05', 5, 92, 0, 1, 2, 0, 2],
      ['2026-06', 6, 28, 1, 1, 3, 0, 4],
      ['2026-07', 12, 29, 1, 1, 4, 0, 4],
    ],
  },
  {
    name: 'CrossData', domain: 'crossdata.co.uk', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 13, referringDomains: 144, backlinks: 441,
    history: [
      ['2025-12', 7, 391, 0, 2, 1, 0, 2],
      ['2026-01', 7, 349, 0, 2, 0, 0, 4],
      ['2026-02', 7, 342, 0, 2, 1, 0, 5],
      ['2026-03', 5, 342, 0, 2, 1, 0, 1],
      ['2026-04', 5, 348, 0, 2, 1, 0, 0],
      ['2026-05', 5, 315, 0, 2, 1, 0, 3],
      ['2026-06', 6, 315, 0, 2, 1, 0, 4],
      ['2026-07', 10, 318, 0, 3, 0, 0, 6],
    ],
  },
  {
    name: 'Noveva Software Group', domain: 'novevasoftwaregroup.com', group: 'Noveva Software Group', database: 'uk',
    authorityScore: 15, referringDomains: 234, backlinks: 2073,
    history: [
      ['2025-12', 5, 34, 0, 1, 0, 0, 3],
      ['2026-01', 6, 34, 0, 1, 0, 0, 5],
      ['2026-02', 8, 129, 76, 1, 1, 0, 7],
      ['2026-03', 7, 129, 76, 1, 2, 0, 5],
      ['2026-04', 2, 1, 0, 0, 1, 0, 1],
      ['2026-05', 1, 1, 0, 0, 0, 0, 1],
      ['2026-06', 8, 22, 0, 1, 1, 0, 7],
      ['2026-07', 11, 22, 0, 1, 3, 0, 9],
    ],
  },
  {
    name: 'RMS / Metrofy', domain: 'metrofy.com', group: 'Forma Innovations', database: 'uk',
    authorityScore: 22, referringDomains: 289, backlinks: 1468,
    history: [
      ['2025-12', 222, 1062, 861, 10, 27, 2, 102],
      ['2026-01', 244, 1058, 854, 12, 27, 1, 111],
      ['2026-02', 241, 1078, 675, 14, 32, 2, 144],
      ['2026-03', 178, 988, 462, 12, 32, 1, 86],
      ['2026-04', 143, 1015, 222, 10, 30, 0, 47],
      ['2026-05', 159, 1017, 199, 12, 28, 0, 97],
      ['2026-06', 167, 2065, 7471, 11, 21, 0, 124],
      ['2026-07', 137, 1794, 3760, 3, 38, 0, 103],
    ],
  },
  {
    name: 'CADS Online', domain: 'cadsonline.com', group: 'Forma Innovations', database: 'uk',
    authorityScore: 23, referringDomains: 442, backlinks: 3260,
    history: [
      ['2025-12', 130, 467, 896, 4, 54, 5, 85],
      ['2026-01', 58, 185, 364, 3, 27, 2, 35],
      ['2026-02', 70, 365, 746, 7, 40, 2, 54],
      ['2026-03', 52, 254, 589, 7, 28, 0, 36],
      ['2026-04', 46, 190, 351, 4, 21, 0, 23],
      ['2026-05', 54, 178, 363, 3, 27, 0, 36],
      ['2026-06', 45, 204, 527, 5, 26, 0, 36],
      ['2026-07', 42, 204, 521, 4, 21, 0, 34],
    ],
  },
  {
    name: 'StoreSpace Insights', domain: 'storespaceinsights.com', group: 'Forma Innovations', database: 'us',
    authorityScore: 23, referringDomains: 225, backlinks: 1981,
    history: [
      ['2025-12', 94, 128, 222, 5, 49, 0, 46],
      ['2026-01', 144, 148, 1990, 10, 79, 2, 75],
      ['2026-02', 157, 91, 1938, 8, 92, 2, 99],
      ['2026-03', 140, 30, 143, 5, 101, 0, 55],
      ['2026-04', 142, 38, 176, 7, 113, 0, 33],
      ['2026-05', 136, 61, 223, 9, 108, 0, 76],
      ['2026-06', 127, 229, 190, 9, 101, 0, 88],
      ['2026-07', 148, 241, 206, 10, 113, 0, 95],
    ],
  },
  {
    name: 'CADS Surveys', domain: 'cadssurveys.co.uk', group: 'Forma Innovations', database: 'uk',
    authorityScore: 6, referringDomains: 131, backlinks: 402,
    history: [
      ['2025-12', 34, 1, 3, 0, 22, 0, 15],
      ['2026-01', 69, 0, 0, 0, 42, 1, 44],
      ['2026-02', 81, 0, 0, 0, 50, 1, 66],
      ['2026-03', 59, 0, 0, 0, 41, 0, 39],
      ['2026-04', 46, 0, 0, 0, 28, 0, 21],
      ['2026-05', 47, 0, 0, 0, 27, 0, 37],
      ['2026-06', 63, 0, 0, 0, 40, 0, 53],
      ['2026-07', 75, 1, 3, 0, 47, 0, 61],
    ],
  },
  {
    name: 'Sofco', domain: 'sofco.co.uk', group: 'Forma Innovations', database: 'uk',
    authorityScore: 9, referringDomains: 143, backlinks: 303,
    history: [
      ['2025-12', 34, 6, 115, 0, 23, 0, 22],
      ['2026-01', 43, 0, 0, 0, 32, 1, 33],
      ['2026-02', 54, 1, 0, 0, 37, 3, 48],
      ['2026-03', 49, 4, 98, 0, 34, 2, 35],
      ['2026-04', 28, 6, 112, 0, 15, 1, 7],
      ['2026-05', 27, 0, 0, 0, 15, 1, 19],
      ['2026-06', 17, 0, 0, 0, 13, 0, 16],
      ['2026-07', 9, 0, 0, 0, 4, 0, 8],
    ],
  },
  {
    name: 'Prosper Design', domain: 'prosper-design.com', group: 'Forma Innovations', database: 'uk',
    authorityScore: 11, referringDomains: 246, backlinks: 1071,
    history: [
      ['2025-12', 48, 10, 17, 1, 2, 0, 21],
      ['2026-01', 36, 5, 12, 0, 3, 0, 9],
      ['2026-02', 32, 5, 12, 0, 4, 0, 12],
      ['2026-03', 24, 7, 4, 0, 2, 0, 7],
      ['2026-04', 28, 7, 4, 0, 1, 0, 3],
      ['2026-05', 35, 8, 0, 0, 4, 0, 8],
      ['2026-06', 29, 9, 3, 0, 5, 0, 11],
      ['2026-07', 23, 6, 3, 0, 2, 0, 10],
    ],
  },
  {
    name: 'Forma Innovations', domain: 'formainnovations.com', group: 'Forma Innovations', database: 'uk',
    authorityScore: 2, referringDomains: 27, backlinks: 36,
    history: [
      ['2025-12', 2, 0, 0, 0, 2, 0, 2],
      ['2026-01', 3, 0, 0, 0, 3, 0, 3],
      ['2026-02', 3, 0, 0, 0, 2, 0, 3],
      ['2026-03', 3, 0, 0, 0, 1, 0, 3],
      ['2026-04', 1, 0, 0, 0, 0, 0, 1],
      ['2026-05', 0, 0, 0, 0, 0, 0, 0],
      ['2026-06', 4, 0, 0, 0, 3, 0, 4],
      ['2026-07', 3, 0, 0, 0, 3, 0, 3],
    ],
  },
  {
    name: 'Meta Broadcast', domain: 'metabroadcast.com', group: 'Standalone', database: 'uk',
    authorityScore: 21, referringDomains: 373, backlinks: 1307,
    history: [
      ['2025-12', 6, 0, 0, 0, 3, 0, 3],
      ['2026-01', 9, 0, 0, 0, 6, 0, 5],
      ['2026-02', 8, 0, 0, 0, 5, 0, 6],
      ['2026-03', 2, 0, 0, 0, 1, 0, 1],
      ['2026-04', 6, 0, 0, 0, 2, 0, 4],
      ['2026-05', 7, 0, 0, 0, 2, 0, 5],
      ['2026-06', 6, 26, 0, 0, 3, 0, 4],
      ['2026-07', 8, 46, 0, 0, 5, 0, 5],
    ],
  },
]

// Index positions within a HistoryRow.
export const H = {
  month: 0, keywords: 1, traffic: 2, cost: 3, top3: 4, aiOverview: 5, featuredSnippet: 6, peopleAlsoAsk: 7,
} as const

/**
 * How much search demand actually exists in each company's category.
 *
 * Several portcos sell through procurement or tender, not search. Ranking them
 * against a company with real category volume misreads "no market" as "failing",
 * so the UI badges them rather than silently penalising them.
 */
export type SearchMarket = 'normal' | 'thin' | 'none'

export const SEARCH_MARKET: Record<string, SearchMarket> = {
  'schoolscreener.com': 'none',
  'formainnovations.com': 'none',
  'crossdata.co.uk': 'thin',
  'novevasoftwaregroup.com': 'thin',
  'ccube.cloud': 'thin',
}

export const SEARCH_MARKET_NOTE: Record<Exclude<SearchMarket, 'normal'>, string> = {
  none: 'No meaningful UK search demand in this category — sells through procurement or direct relationships, so a low score is not a marketing failure.',
  thin: 'Very little UK search demand in this category. Score is capped by the size of the market, not by effort.',
}

/**
 * The keywords actually driving each company's organic traffic, top first.
 * Pulled 12 August 2026. Answers the obvious question a score alone cannot:
 * what are we actually ranking for?
 */
export type TopKeyword = { keyword: string; position: number; traffic: number }

export const TOP_KEYWORDS: Record<string, readonly TopKeyword[]> = {
  'charitylog.co.uk': [
    { keyword: 'charity log', position: 1, traffic: 7920 },
    { keyword: 'charitylog', position: 1, traffic: 2880 },
    { keyword: 'charity log login', position: 1, traffic: 2320 },
    { keyword: 'charitylog login', position: 1, traffic: 1040 },
    { keyword: 'charity crm', position: 3, traffic: 59 },
  ],
  'dizions.co.uk': [
    { keyword: 'charity log', position: 4, traffic: 138 },
    { keyword: 'charitylog', position: 6, traffic: 36 },
    { keyword: 'charitylog login', position: 3, traffic: 23 },
    { keyword: 'text anywhere', position: 4, traffic: 19 },
    { keyword: 'somerset village agents', position: 5, traffic: 11 },
  ],
  'mindofmyown.org.uk': [
    { keyword: 'mind of my own', position: 1, traffic: 800 },
    { keyword: 'mind of my own app', position: 1, traffic: 136 },
    { keyword: 'mindofmyown', position: 1, traffic: 88 },
    { keyword: 'a mind of my own', position: 3, traffic: 48 },
    { keyword: 'momo app', position: 5, traffic: 5 },
  ],
  'metrofy.com': [
    { keyword: 'retail management solutions', position: 1, traffic: 871 },
    { keyword: 'cardfactory rms metro com login', position: 4, traffic: 57 },
    { keyword: 'card factory rms', position: 4, traffic: 38 },
    { keyword: 'bob card factory', position: 6, traffic: 30 },
    { keyword: 'rms metro', position: 2, traffic: 27 },
  ],
  'cadsonline.com': [
    { keyword: 'cads', position: 6, traffic: 69 },
    { keyword: 'cads planner', position: 1, traffic: 52 },
    { keyword: 'retail space planning', position: 3, traffic: 9 },
    { keyword: 'housing survey', position: 6, traffic: 9 },
    { keyword: 'matterport survey', position: 4, traffic: 5 },
  ],
  'storespaceinsights.com': [
    { keyword: 'retail space planning', position: 3, traffic: 7 },
    { keyword: 'retail space planning software', position: 3, traffic: 6 },
    { keyword: 'store planning software', position: 2, traffic: 5 },
    { keyword: 'space planning in retail stores', position: 2, traffic: 5 },
    { keyword: 'retail space optimization', position: 6, traffic: 4 },
  ],
  'crossdata.co.uk': [
    { keyword: 'cross data', position: 1, traffic: 168 },
    { keyword: 'crossdata', position: 1, traffic: 136 },
    { keyword: 'h4all', position: 2, traffic: 2 },
    { keyword: 'callready', position: 14, traffic: 0 },
  ],
  'schoolscreener.com': [
    { keyword: 'schoolscreener', position: 1, traffic: 27 },
    { keyword: 'sch portal', position: 18, traffic: 1 },
    { keyword: 'parent viewer', position: 16, traffic: 1 },
    { keyword: 'cranbrook portal', position: 21, traffic: 0 },
  ],
  'ccube.cloud': [
    { keyword: 'ccube', position: 3, traffic: 13 },
    { keyword: 'carecube', position: 30, traffic: 0 },
    { keyword: 'care cube', position: 23, traffic: 0 },
  ],
  'novevasoftwaregroup.com': [
    { keyword: 'ccube', position: 2, traffic: 22 },
    { keyword: 'caivov', position: 30, traffic: 0 },
    { keyword: 'inkva', position: 39, traffic: 0 },
    { keyword: 'advanced computer software group ltd', position: 47, traffic: 0 },
  ],
  'sofco.co.uk': [
    { keyword: 'psco ltd', position: 18, traffic: 0 },
    { keyword: 'softco', position: 35, traffic: 0 },
    { keyword: 'karro food', position: 21, traffic: 0 },
    { keyword: 'nasco uk ltd', position: 53, traffic: 0 },
  ],
  'cadssurveys.co.uk': [
    { keyword: 'façade surveys', position: 7, traffic: 1 },
    { keyword: 'measured building surveys', position: 94, traffic: 0 },
    { keyword: 'facade surveys', position: 46, traffic: 0 },
    { keyword: '3d laser scanning services', position: 96, traffic: 0 },
  ],
  'prosper-design.com': [
    { keyword: 'warings lifestore', position: 6, traffic: 2 },
    { keyword: 'retail design company', position: 44, traffic: 0 },
    { keyword: 'retail design firms', position: 41, traffic: 0 },
    { keyword: 'urban design consultant milton keynes', position: 40, traffic: 0 },
  ],
  'metabroadcast.com': [
    { keyword: '7.0.5', position: 9, traffic: 22 },
    { keyword: 'metastreaming', position: 10, traffic: 15 },
    { keyword: 'metastream', position: 49, traffic: 0 },
    { keyword: 'broadcast.com', position: 55, traffic: 0 },
  ],
  'formainnovations.com': [
    { keyword: 'forma company', position: 38, traffic: 0 },
  ],
}
