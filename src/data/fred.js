// Series from FRED (Federal Reserve Bank of St. Louis). Each id is the FRED series id.
// src names who publishes the number. freq is how often it updates.
const F = (title, unit, src, freq = 'monthly') => ({ title, unit, src, freq })

export const FRED = {
  // Poultry and eggs
  APU0000FF1101: F('Chicken breast, boneless', '$ per lb', 'BLS retail price'),
  APU0000708111: F('Eggs, grade A large', '$ per dozen', 'BLS retail price'),
  PCU311615311615: F('Poultry processing', 'index, Dec 1981=100', 'BLS producer price'),
  PCU3116153116151: F('Young chickens', 'index', 'BLS producer price'),
  WPU022209: F('Chicken hens and other poultry', 'index, 1982=100', 'BLS producer price'),
  PPOULTUSDM: F('Global poultry price', 'cents per lb', 'IMF'),

  // Beef, pork and other meat
  APU0000703112: F('Ground beef, 100% beef', '$ per lb', 'BLS retail price'),
  APU0000704111: F('Bacon, sliced', '$ per lb', 'BLS retail price'),
  PBEEFUSDM: F('Global beef price', 'cents per lb', 'IMF'),
  PPORKUSDM: F('Global pork (swine) price', 'cents per lb', 'IMF'),

  // Grains and softs
  PMAIZMTUSDM: F('Global corn price', '$ per tonne', 'IMF'),
  PWHEAMTUSDM: F('Global wheat price', '$ per tonne', 'IMF'),
  PSUGAISAUSDM: F('Global sugar price', 'cents per lb', 'IMF'),
  PCOCOUSDM: F('Global cocoa price', '$ per tonne', 'IMF'),
  PCOFFROBUSDM: F('Global coffee price, robusta', 'cents per lb', 'IMF'),
  PCOTTINDUSDM: F('Global cotton price', 'cents per lb', 'IMF'),

  // Energy and freight
  GASDESW: F('US diesel retail price', '$ per gallon', 'EIA', 'weekly'),
  DHHNGSP: F('Henry Hub natural gas', '$ per MMBtu', 'EIA', 'daily'),
  POILWTIUSDM: F('WTI crude oil, monthly average', '$ per barrel', 'IMF'),
  TSIFRGHT: F('Freight Transportation Services Index', 'index, 2000=100', 'US DOT BTS'),
  PCU484121484121: F('Long-distance truckload freight', 'index, Dec 2003=100', 'BLS producer price'),

  // Materials and inputs
  WPU081: F('Lumber', 'index, 1982=100', 'BLS producer price'),
  WPU0811: F('Softwood lumber', 'index, 1982=100', 'BLS producer price'),
  WPU1017: F('Steel mill products', 'index, 1982=100', 'BLS producer price'),
  WPU101704: F('Hot rolled steel bars, plates, shapes', 'index', 'BLS producer price'),
  PCU325211325211: F('Plastics material and resin', 'index', 'BLS producer price'),
  WPU091: F('Pulp, paper and products', 'index, 1982=100', 'BLS producer price'),
  WPU091503: F('Paper boxes and containers', 'index, 1982=100', 'BLS producer price'),
  WPU09140551: F('Corrugated paperboard', 'index, 1982=100', 'BLS producer price'),
  PCU334413334413: F('Semiconductors', 'index, Dec 1998=100', 'BLS producer price'),
  PCOPPUSDM: F('Global copper price', '$ per tonne', 'IMF'),
  PALUMUSDM: F('Global aluminum price', '$ per tonne', 'IMF'),
  PALLFNFINDEXM: F('Global commodity price index', 'index, 2016=100', 'IMF'),

  // Labor
  TEMPHELPS: F('Temporary help employment', 'thousands of jobs', 'BLS'),
}

export const FRED_GROUPS = [
  { title: 'Poultry and eggs', ids: ['APU0000FF1101', 'APU0000708111', 'PCU311615311615', 'PCU3116153116151', 'WPU022209', 'PPOULTUSDM'] },
  { title: 'Beef, pork and other meat', ids: ['APU0000703112', 'APU0000704111', 'PBEEFUSDM', 'PPORKUSDM'] },
  { title: 'Grains and softs', ids: ['PMAIZMTUSDM', 'PWHEAMTUSDM', 'PSUGAISAUSDM', 'PCOCOUSDM', 'PCOFFROBUSDM', 'PCOTTINDUSDM'] },
  { title: 'Energy and freight costs', ids: ['GASDESW', 'DHHNGSP', 'POILWTIUSDM', 'TSIFRGHT', 'PCU484121484121'] },
  { title: 'Materials and inputs', ids: ['WPU081', 'WPU0811', 'WPU1017', 'WPU101704', 'PCU325211325211', 'WPU091', 'WPU091503', 'WPU09140551', 'PCU334413334413', 'PCOPPUSDM', 'PALUMUSDM', 'PALLFNFINDEXM'] },
  { title: 'Labor', ids: ['TEMPHELPS'] },
]

export const ALL_FRED = Object.keys(FRED)
