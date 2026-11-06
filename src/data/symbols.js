// name, rough price level used only for sample data, annual volatility, unit
const S = (name, base, vol, unit = '') => ({ name, base, vol, unit })

export const SYMBOLS = {
  // Commodities and proxies
  'CL=F': S('WTI crude oil', 68, 0.35, '$/bbl'),
  'BZ=F': S('Brent crude oil', 72, 0.33, '$/bbl'),
  'NG=F': S('Natural gas', 3.4, 0.6, '$/MMBtu'),
  'HO=F': S('Diesel (ULSD)', 2.4, 0.35, '$/gal'),
  'RB=F': S('Gasoline (RBOB)', 2.1, 0.35, '$/gal'),
  'HG=F': S('Copper', 4.6, 0.25, '$/lb'),
  'ALI=F': S('Aluminum', 2650, 0.2, '$/t'),
  'GC=F': S('Gold', 3300, 0.17, '$/oz'),
  'ZC=F': S('Corn', 440, 0.22, 'c/bu'),
  'ZW=F': S('Wheat', 550, 0.3, 'c/bu'),
  'ZS=F': S('Soybeans', 1030, 0.18, 'c/bu'),
  'ZL=F': S('Soybean oil', 49, 0.3, 'c/lb'),
  'SB=F': S('Sugar', 17, 0.3, 'c/lb'),
  'KC=F': S('Coffee', 300, 0.4, 'c/lb'),
  'CC=F': S('Cocoa', 7500, 0.55, '$/t'),
  'CT=F': S('Cotton', 67, 0.2, 'c/lb'),
  'LBR=F': S('Lumber', 580, 0.35, '$/mbf'),
  'HRC=F': S('US hot rolled coil steel', 850, 0.3, '$/st'),
  BDRY: S('Dry bulk freight (BDRY ETF)', 9, 0.6, '$'),
  SOXX: S('Semiconductor ETF (SOXX)', 220, 0.38, '$'),
  SLX: S('Steel ETF (SLX)', 70, 0.28, '$'),

  // Macro and market
  '^GSPC': S('S&P 500', 6500, 0.16, 'pts'),
  '^DJI': S('Dow Jones', 45000, 0.14, 'pts'),
  '^TNX': S('US 10 year yield', 4.2, 0.18, '%'),
  'DX-Y.NYB': S('US dollar index', 99, 0.07, 'pts'),

  // Lumber
  WY: S('Weyerhaeuser', 27, 0.28),
  RYN: S('Rayonier', 24, 0.28),
  UFPI: S('UFP Industries', 105, 0.32),
  BCC: S('Boise Cascade', 100, 0.38),
  PCH: S('PotlatchDeltic', 40, 0.28),
  WFG: S('West Fraser', 80, 0.34),

  // Freight
  UPS: S('UPS', 105, 0.3),
  FDX: S('FedEx', 230, 0.32),
  XPO: S('XPO', 130, 0.4),
  ODFL: S('Old Dominion Freight Line', 160, 0.32),
  JBHT: S('J.B. Hunt', 155, 0.32),
  CHRW: S('C.H. Robinson', 100, 0.3),
  EXPD: S('Expeditors', 120, 0.25),
  SAIA: S('Saia', 330, 0.45),
  MATX: S('Matson', 120, 0.35),
  ZIM: S('ZIM Integrated Shipping', 17, 0.55),

  // Fabrics and textiles
  GIL: S('Gildan Activewear', 50, 0.3),
  UFI: S('Unifi', 5, 0.45),
  CULP: S('Culp', 5, 0.45),
  '3402.T': S('Toray Industries', 950, 0.28),
  '2313.HK': S('Shenzhou International', 70, 0.35),
  LEVI: S('Levi Strauss', 20, 0.35),

  // Steel
  NUE: S('Nucor', 135, 0.35),
  STLD: S('Steel Dynamics', 140, 0.33),
  CLF: S('Cleveland-Cliffs', 11, 0.6),
  MT: S('ArcelorMittal', 32, 0.35),
  RS: S('Reliance', 290, 0.25),
  CMC: S('Commercial Metals', 55, 0.32),
  PKX: S('POSCO Holdings', 55, 0.3),
  TX: S('Ternium', 32, 0.3),

  // Aluminum and metals
  AA: S('Alcoa', 32, 0.5),
  CENX: S('Century Aluminum', 22, 0.55),
  KALU: S('Kaiser Aluminum', 80, 0.35),
  RIO: S('Rio Tinto', 62, 0.27),
  BHP: S('BHP', 50, 0.27),
  FCX: S('Freeport-McMoRan', 42, 0.38),
  SCCO: S('Southern Copper', 105, 0.35),

  // Packaging and paper
  IP: S('International Paper', 50, 0.32),
  PKG: S('Packaging Corp of America', 220, 0.25),
  SW: S('Smurfit Westrock', 42, 0.3),
  AMCR: S('Amcor', 9, 0.25),
  BALL: S('Ball Corp', 55, 0.25),
  CCK: S('Crown Holdings', 95, 0.25),
  SEE: S('Sealed Air', 33, 0.3),
  GPK: S('Graphic Packaging', 22, 0.32),
  SON: S('Sonoco', 47, 0.25),

  // Energy
  XOM: S('Exxon Mobil', 110, 0.22),
  CVX: S('Chevron', 150, 0.22),
  COP: S('ConocoPhillips', 92, 0.28),
  EOG: S('EOG Resources', 115, 0.28),
  OXY: S('Occidental', 45, 0.35),
  VLO: S('Valero', 140, 0.32),
  MPC: S('Marathon Petroleum', 165, 0.3),
  PSX: S('Phillips 66', 125, 0.28),
  SLB: S('SLB', 36, 0.35),

  // Electronics
  TSM: S('TSMC', 240, 0.4),
  TXN: S('Texas Instruments', 180, 0.3),
  MU: S('Micron', 110, 0.55),
  MCHP: S('Microchip', 55, 0.45),
  NXPI: S('NXP Semiconductors', 215, 0.38),
  ON: S('onsemi', 50, 0.5),
  ADI: S('Analog Devices', 230, 0.3),
  INTC: S('Intel', 25, 0.5),

  // Chemicals and plastics
  DOW: S('Dow', 27, 0.4),
  LYB: S('LyondellBasell', 60, 0.38),
  DD: S('DuPont', 78, 0.28),
  CE: S('Celanese', 55, 0.5),
  EMN: S('Eastman Chemical', 75, 0.3),
  HUN: S('Huntsman', 11, 0.45),
  WLK: S('Westlake', 90, 0.35),
  APD: S('Air Products', 280, 0.25),

  // Food and agriculture
  ADM: S('Archer-Daniels-Midland', 58, 0.28),
  BG: S('Bunge', 85, 0.3),
  INGR: S('Ingredion', 130, 0.22),
  TSN: S('Tyson Foods', 54, 0.27),
  CTVA: S('Corteva', 65, 0.27),
  MOS: S('Mosaic', 28, 0.38),
  DAR: S('Darling Ingredients', 33, 0.38),
}

export const nameOf = (sym) => SYMBOLS[sym]?.name || sym
