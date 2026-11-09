import { CATEGORIES, BENCHMARKS } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { buildIndex } from './series'

// 1 day change: the latest point against the one before it.
export const dayChange = (s) => (s && s.v.length > 1 ? (s.v[s.v.length - 1] / s.v[s.v.length - 2] - 1) * 100 : null)

// Everything that can show up as a daily mover: category indexes, commodities and benchmarks, and supplier stocks.
export function marketMovers(get) {
  const items = []
  const seen = new Set()
  const add = (kind, label, name, series, to) => {
    const ch = dayChange(series)
    if (ch == null || !Number.isFinite(ch)) return
    items.push({ kind, label, name, ch, to })
  }

  CATEGORIES.forEach((c) => {
    add('Index', c.name, `${c.name} supplier index`, buildIndex(c.basket.map((b) => get(b))), `/categories/${c.id}`)
  })

  const markets = new Set([...BENCHMARKS.flatMap((g) => g.symbols), ...CATEGORIES.flatMap((c) => c.commodities)])
  markets.forEach((sym) => {
    seen.add(sym)
    add('Market', SYMBOLS[sym]?.name || sym, sym, get(sym), `/indexes?q=${encodeURIComponent(sym)}`)
  })

  CATEGORIES.forEach((c) =>
    c.basket.forEach((sym) => {
      if (seen.has(sym)) return
      seen.add(sym)
      add('Stock', SYMBOLS[sym]?.name || sym, sym, get(sym), `/categories/${c.id}`)
    }),
  )

  const sorted = [...items].sort((a, b) => b.ch - a.ch)
  return {
    up: sorted.filter((i) => i.ch > 0).slice(0, 3),
    down: sorted.filter((i) => i.ch < 0).reverse().slice(0, 3),
    count: items.length,
  }
}
