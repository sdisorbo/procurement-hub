import { CATEGORIES, BENCHMARKS } from '../data/categories'
import { SYMBOLS } from '../data/symbols'

export const norm = (s) => String(s || '').toLowerCase()

// Every typed word has to match the start of a word, so "lum" finds Lumber but not Aluminum.
export const matches = (q, ...fields) => {
  const n = norm(q).trim()
  if (!n) return true
  const hay = ' ' + fields.map(norm).join(' ').replace(/[^a-z0-9.=^&]+/g, ' ')
  return n.split(/\s+/).every((w) => hay.includes(' ' + w))
}

// Everything the home page search can jump to.
export const SEARCH_ITEMS = [
  ...CATEGORIES.map((c) => ({
    type: 'Category',
    label: c.name,
    sub: c.blurb,
    to: `/categories/${c.id}`,
    text: [c.name, c.blurb, ...c.basket, ...c.suppliers.map((s) => s[0])].join(' '),
  })),
  ...CATEGORIES.map((c) => ({
    type: 'Index',
    label: `${c.name} supplier index`,
    sub: `${c.basket.length} companies`,
    to: `/indexes?q=${encodeURIComponent(c.name)}`,
    text: [c.name, 'index', ...c.basket].join(' '),
  })),
  ...BENCHMARKS.flatMap((g) =>
    g.symbols.map((s) => ({
      type: 'Benchmark',
      label: SYMBOLS[s]?.name || s,
      sub: s,
      to: `/indexes?q=${encodeURIComponent(s)}`,
      text: [SYMBOLS[s]?.name, s, g.title].join(' '),
    })),
  ),
]
