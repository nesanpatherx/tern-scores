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
 * Every domain is measured against the SEMrush **UK** database. This is a UK
 * portfolio and mixing regional databases would mean companies were not being
 * compared on the same basis.
 */
export const DATA_AS_OF = '2026-08-11'
export const LATEST_MONTH = '2026-07'
export const BASELINE_MONTH = '2026-01'

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
    name: 'StoreSpace Insights', domain: 'storespaceinsights.com', group: 'Forma Innovations', database: 'uk',
    authorityScore: 23, referringDomains: 225, backlinks: 1981,
    history: [
      ['2025-12', 10, 0, 0, 0, 4, 0, 7],
      ['2026-01', 11, 0, 0, 0, 3, 0, 10],
      ['2026-02', 17, 25, 160, 1, 5, 0, 16],
      ['2026-03', 12, 25, 160, 1, 6, 0, 10],
      ['2026-04', 19, 24, 90, 1, 8, 0, 17],
      ['2026-05', 19, 27, 102, 1, 9, 0, 18],
      ['2026-06', 17, 95, 486, 1, 10, 0, 15],
      ['2026-07', 17, 110, 474, 1, 11, 0, 15],
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
