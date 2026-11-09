// display name and unit
const S = (name, unit = '') => ({ name, unit })

export const SYMBOLS = {
  // Commodities and proxies
  'CL=F': S('WTI crude oil', '$/bbl'),
  'BZ=F': S('Brent crude oil', '$/bbl'),
  'NG=F': S('Natural gas', '$/MMBtu'),
  'HO=F': S('Diesel (ULSD)', '$/gal'),
  'RB=F': S('Gasoline (RBOB)', '$/gal'),
  'HG=F': S('Copper', '$/lb'),
  'ALI=F': S('Aluminum', '$/t'),
  'GC=F': S('Gold', '$/oz'),
  'ZC=F': S('Corn', 'c/bu'),
  'ZW=F': S('Wheat', 'c/bu'),
  'ZS=F': S('Soybeans', 'c/bu'),
  'ZL=F': S('Soybean oil', 'c/lb'),
  'SB=F': S('Sugar', 'c/lb'),
  'KC=F': S('Coffee', 'c/lb'),
  'CC=F': S('Cocoa', '$/t'),
  'CT=F': S('Cotton', 'c/lb'),
  'LBR=F': S('Lumber', '$/mbf'),
  'HRC=F': S('US hot rolled coil steel', '$/st'),
  BDRY: S('Dry bulk freight (BDRY ETF)', '$'),
  SOXX: S('Semiconductor ETF (SOXX)', '$'),
  SLX: S('Steel ETF (SLX)', '$'),

  // Macro and market
  '^GSPC': S('S&P 500', 'pts'),
  '^DJI': S('Dow Jones', 'pts'),
  '^TNX': S('US 10 year yield', '%'),
  'DX-Y.NYB': S('US dollar index', 'pts'),

  // Lumber
  WY: S('Weyerhaeuser'),
  RYN: S('Rayonier'),
  UFPI: S('UFP Industries'),
  BCC: S('Boise Cascade'),
  PCH: S('PotlatchDeltic'),
  WFG: S('West Fraser'),

  // Freight
  UPS: S('UPS'),
  FDX: S('FedEx'),
  XPO: S('XPO'),
  ODFL: S('Old Dominion Freight Line'),
  JBHT: S('J.B. Hunt'),
  CHRW: S('C.H. Robinson'),
  EXPD: S('Expeditors'),
  SAIA: S('Saia'),
  MATX: S('Matson'),
  ZIM: S('ZIM Integrated Shipping'),

  // Fabrics and textiles
  GIL: S('Gildan Activewear'),
  UFI: S('Unifi'),
  CULP: S('Culp'),
  '3402.T': S('Toray Industries'),
  '2313.HK': S('Shenzhou International'),
  LEVI: S('Levi Strauss'),

  // Steel
  NUE: S('Nucor'),
  STLD: S('Steel Dynamics'),
  CLF: S('Cleveland-Cliffs'),
  MT: S('ArcelorMittal'),
  RS: S('Reliance'),
  CMC: S('Commercial Metals'),
  PKX: S('POSCO Holdings'),
  TX: S('Ternium'),

  // Aluminum and metals
  AA: S('Alcoa'),
  CENX: S('Century Aluminum'),
  KALU: S('Kaiser Aluminum'),
  RIO: S('Rio Tinto'),
  BHP: S('BHP'),
  FCX: S('Freeport-McMoRan'),
  SCCO: S('Southern Copper'),

  // Packaging and paper
  IP: S('International Paper'),
  PKG: S('Packaging Corp of America'),
  SW: S('Smurfit Westrock'),
  AMCR: S('Amcor'),
  BALL: S('Ball Corp'),
  CCK: S('Crown Holdings'),
  SEE: S('Sealed Air'),
  GPK: S('Graphic Packaging'),
  SON: S('Sonoco'),

  // Energy
  XOM: S('Exxon Mobil'),
  CVX: S('Chevron'),
  COP: S('ConocoPhillips'),
  EOG: S('EOG Resources'),
  OXY: S('Occidental'),
  VLO: S('Valero'),
  MPC: S('Marathon Petroleum'),
  PSX: S('Phillips 66'),
  SLB: S('SLB'),

  // Electronics
  TSM: S('TSMC'),
  TXN: S('Texas Instruments'),
  MU: S('Micron'),
  MCHP: S('Microchip'),
  NXPI: S('NXP Semiconductors'),
  ON: S('onsemi'),
  ADI: S('Analog Devices'),
  INTC: S('Intel'),

  // Chemicals and plastics
  DOW: S('Dow'),
  LYB: S('LyondellBasell'),
  DD: S('DuPont'),
  CE: S('Celanese'),
  EMN: S('Eastman Chemical'),
  HUN: S('Huntsman'),
  WLK: S('Westlake'),
  APD: S('Air Products'),

  // Food and agriculture
  ADM: S('Archer-Daniels-Midland'),
  BG: S('Bunge'),
  INGR: S('Ingredion'),
  TSN: S('Tyson Foods'),
  CTVA: S('Corteva'),
  MOS: S('Mosaic'),
  DAR: S('Darling Ingredients'),

  // MRO
  GWW: S('Grainger'), FAST: S('Fastenal'), MSM: S('MSC Industrial'), WCC: S('Wesco'), AIT: S('Applied Industrial'),
  FERG: S('Ferguson'), MMM: S('3M'), GPC: S('Genuine Parts'), DNOW: S('DNOW'),

  // Data centers
  EQIX: S('Equinix'), DLR: S('Digital Realty'), VRT: S('Vertiv'), ETN: S('Eaton'), SMCI: S('Super Micro Computer'),
  ANET: S('Arista Networks'), NVDA: S('NVIDIA'), GEV: S('GE Vernova'), DELL: S('Dell Technologies'),

  // Clean energy
  ICLN: S('Global clean energy ETF (ICLN)'), TAN: S('Solar ETF (TAN)'), LIT: S('Lithium and battery ETF (LIT)'),
  FSLR: S('First Solar'), ENPH: S('Enphase Energy'), NEE: S('NextEra Energy'), ALB: S('Albemarle'),
  BEP: S('Brookfield Renewable'), PLUG: S('Plug Power'),

  // IT
  IGV: S('Software ETF (IGV)'), MSFT: S('Microsoft'), ORCL: S('Oracle'), CRM: S('Salesforce'), ACN: S('Accenture'),
  IBM: S('IBM'), CSCO: S('Cisco'), NOW: S('ServiceNow'), HPQ: S('HP Inc'),

  // Contingent labor
  RHI: S('Robert Half'), MAN: S('ManpowerGroup'), KFRC: S('Kforce'), KELYA: S('Kelly Services'), ASGN: S('ASGN'),
  TBI: S('TrueBlue'), 'RAND.AS': S('Randstad'), 'ADEN.SW': S('Adecco'),

  // Life sciences
  XBI: S('Biotech ETF (XBI)'), TMO: S('Thermo Fisher'), DHR: S('Danaher'), A: S('Agilent'), WAT: S('Waters'),
  IQV: S('IQVIA'), CRL: S('Charles River Labs'), MTD: S('Mettler-Toledo'), WST: S('West Pharmaceutical'),
}

export const nameOf = (sym) => SYMBOLS[sym]?.name || sym

const EQUIP = { van: 'van', reefer: 'reefer', flatbed: 'flatbed' }
// Names for DAT rate series, keyed like DAT:spot:van
export const driverName = (key) => {
  if (key.startsWith('DAT:')) {
    const [, kind, eq] = key.split(':')
    return `DAT ${EQUIP[eq]} ${kind} rate`
  }
  return nameOf(key)
}
