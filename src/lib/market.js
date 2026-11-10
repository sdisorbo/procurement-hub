import { CATEGORIES, BENCHMARKS } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { buildIndex } from './series'

const SHORT = { '^GSPC': 'S&P 500', 'CL=F': 'WTI', 'BZ=F': 'Brent', 'HO=F': 'Diesel', 'RB=F': 'Gasoline', 'NG=F': 'Nat gas', 'HG=F': 'Copper', 'ALI=F': 'Aluminum', 'GC=F': 'Gold', 'LBR=F': 'Lumber', 'HRC=F': 'Steel HRC', 'ZC=F': 'Corn', 'ZW=F': 'Wheat', 'ZS=F': 'Soybeans', 'ZL=F': 'Soy oil', 'SB=F': 'Sugar', 'KC=F': 'Coffee', 'CC=F': 'Cocoa', 'CT=F': 'Cotton', BDRY: 'Dry bulk', '^TNX': '10Y yield', '^DJI': 'Dow', 'DX-Y.NYB': 'USD index' }

// 1 day change: the latest point against the one before it.
export const dayChange = (s) => (s && s.v.length > 1 ? (s.v[s.v.length - 1] / s.v[s.v.length - 2] - 1) * 100 : null)

// Everything that can show up as a daily mover: category indexes, commodities and benchmarks, and supplier stocks.
export function marketMovers(get) {
  const items = []
  const seen = new Set()
  const add = (kind, label, name, series, to, extra = {}) => {
    const ch = dayChange(series)
    if (ch == null || !Number.isFinite(ch)) return
    items.push({ kind, label, name, ch, to, series, ...extra })
  }

  CATEGORIES.forEach((c) => {
    add('Index', c.name, `${c.name} supplier index`, buildIndex(c.basket.map((b) => get(b))), `/categories/${c.id}`, { query: c.newsQuery, unit: 'index, base 100', cat: c })
  })

  const markets = new Set([...BENCHMARKS.flatMap((g) => g.symbols), ...CATEGORIES.flatMap((c) => c.commodities)])
  markets.forEach((sym) => {
    seen.add(sym)
    add('Market', SHORT[sym] || SYMBOLS[sym]?.name || sym, SYMBOLS[sym]?.name || sym, get(sym), `/indexes?q=${encodeURIComponent(sym)}`, { query: `${SYMBOLS[sym]?.name || sym} price`, unit: SYMBOLS[sym]?.unit, symbol: sym })
  })

  CATEGORIES.forEach((c) =>
    c.basket.forEach((sym) => {
      if (seen.has(sym)) return
      seen.add(sym)
      add('Stock', sym, SYMBOLS[sym]?.name || sym, get(sym), `/categories/${c.id}`, { query: `"${SYMBOLS[sym]?.name || sym}" stock OR shares`, unit: '', symbol: sym, cat: c })
    }),
  )

  const sorted = [...items].sort((a, b) => b.ch - a.ch)
  // Every mover, biggest move first in either direction. The grid pages through this list.
  const tiles = [...items].sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch))
  return {
    tiles,
    up: sorted.filter((i) => i.ch > 0).slice(0, 3),
    down: sorted.filter((i) => i.ch < 0).reverse().slice(0, 3),
    count: items.length,
  }
}
