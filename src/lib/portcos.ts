export type PortcoGroup = 'Noveva Software Group' | 'Forma Innovations' | 'Standalone'

export type Portco = {
  name: string
  domain: string
  group: PortcoGroup
  /**
   * SEMrush regional database to query. Most of the portfolio is UK-focused;
   * StoreSpace Insights indexes in the US database instead. When unset both are
   * queried and the one reporting more organic traffic wins.
   */
  database?: 'uk' | 'us'
}

export const PORTCOS: Portco[] = [
  // Noveva Software Group
  { name: 'Charity Log',           domain: 'charitylog.co.uk',        group: 'Noveva Software Group' },
  { name: 'CrossData',             domain: 'crossdata.co.uk',         group: 'Noveva Software Group' },
  { name: 'Dizions',               domain: 'dizions.co.uk',           group: 'Noveva Software Group' },
  { name: 'Mind Of My Own',        domain: 'mindofmyown.org.uk',      group: 'Noveva Software Group' },
  { name: 'CCube Solutions',       domain: 'ccube.cloud',             group: 'Noveva Software Group' },
  { name: 'SchoolScreener',        domain: 'schoolscreener.com',      group: 'Noveva Software Group' },
  { name: 'Noveva Software Group', domain: 'novevasoftwaregroup.com', group: 'Noveva Software Group' },

  // Forma Innovations
  { name: 'Forma Innovations',     domain: 'formainnovations.com',    group: 'Forma Innovations' },
  { name: 'CADS Online',           domain: 'cadsonline.com',          group: 'Forma Innovations' },
  { name: 'CADS Surveys',          domain: 'cadssurveys.co.uk',       group: 'Forma Innovations' },
  { name: 'RMS / Metrofy',         domain: 'metrofy.com',             group: 'Forma Innovations' },
  { name: 'Sofco',                 domain: 'sofco.co.uk',             group: 'Forma Innovations' },
  { name: 'StoreSpace Insights',   domain: 'storespaceinsights.com',  group: 'Forma Innovations' },
  { name: 'Prosper Design',        domain: 'prosper-design.com',      group: 'Forma Innovations' },

  // Standalone
  { name: 'Meta Broadcast',        domain: 'metabroadcast.com',       group: 'Standalone' },
]

export const GROUP_ORDER: PortcoGroup[] = [
  'Noveva Software Group',
  'Forma Innovations',
  'Standalone',
]
