import { SYMBOLS } from '../data/symbols'

export const RANGES = [
  { id: '1M', label: '1M', n: 22 },
  { id: '3M', label: '3M', n: 64 },
  { id: '6M', label: '6M', n: 127 },
  { id: '1Y', label: '1Y', n: 400 },
]

// Seeded random so sample data looks the same on every visit.
function rng(seedStr) {
  let h = 1779033703
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const gauss = (r) => {
  const u = Math.max(r(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

function businessDays(count) {
  const out = []
  const d = new Date()
  d.setUTCHours(12, 0, 0, 0)
  while (out.length < count) {
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) out.unshift(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return out
}

export function sampleSeries(symbol, count = 252) {
  const meta = SYMBOLS[symbol] || { base: 100, vol: 0.3 }
  const r = rng(symbol)
  const dates = businessDays(count)
  const dailyVol = meta.vol / Math.sqrt(252)
  const drift = (r() - 0.5) * 0.0012
  // Work backwards from the base price so the latest value sits near it.
  const raw = [1]
  for (let i = 1; i < count; i++) {
    raw.push(raw[i - 1] * Math.exp(drift + dailyVol * gauss(r)))
  }
  const scale = meta.base / raw[count - 1]
  const v = raw.map((x) => Math.round(x * scale * 10000) / 10000)
  return { d: dates, v, sample: true }
}

export const sliceRange = (s, rangeId) => {
  const n = RANGES.find((r) => r.id === rangeId)?.n ?? 400
  const start = Math.max(0, s.d.length - n)
  return { ...s, d: s.d.slice(start), v: s.v.slice(start) }
}

export const last = (s) => s.v[s.v.length - 1]

export function pctChange(s, n) {
  const len = s.v.length
  if (len < 2) return 0
  const from = s.v[Math.max(0, len - 1 - n)]
  return (s.v[len - 1] / from - 1) * 100
}

export function periodChange(s) {
  return s.v.length > 1 ? (s.v[s.v.length - 1] / s.v[0] - 1) * 100 : 0
}

export function volatility(s, n = 63) {
  const v = s.v.slice(-(n + 1))
  if (v.length < 5) return 0
  const rets = []
  for (let i = 1; i < v.length; i++) rets.push(Math.log(v[i] / v[i - 1]))
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

// Equal weight synthetic index, base 100 on the first date. Missing days carry the last value forward.
export function buildIndex(seriesList) {
  const valid = seriesList.filter((s) => s && s.v.length > 5)
  if (!valid.length) return { d: [], v: [] }
  const dates = Array.from(new Set(valid.flatMap((s) => s.d))).sort()
  const start = dates[Math.max(0, dates.length - 252)]
  const useDates = dates.filter((x) => x >= start)
  const filled = valid.map((s) => {
    const m = new Map(s.d.map((x, i) => [x, s.v[i]]))
    let prev = null
    let firstKnown = s.v[0]
    return useDates.map((dt) => {
      if (m.has(dt)) prev = m.get(dt)
      return prev ?? firstKnown
    })
  })
  const v = useDates.map((_, i) => {
    const avg = filled.reduce((acc, arr) => acc + arr[i] / arr[0], 0) / filled.length
    return Math.round(avg * 10000) / 100
  })
  const sampleCount = valid.filter((s) => s.sample).length
  return { d: useDates, v, sample: sampleCount > 0, sampleCount, total: valid.length }
}

const TAGS = [
  { min: 8, tag: "Seller's market", level: 4, advice: 'Prices are climbing. Lock volume early, widen the supplier list, and expect pushback on payment terms.' },
  { min: 3, tag: 'Firming', level: 3, advice: 'Prices are edging up. Consider layering in forward cover and test index linked pricing.' },
  { min: -3, tag: 'Balanced', level: 2, advice: 'Prices are flat. A good window to renegotiate terms, qualify a second source, or simplify specs.' },
  { min: -8, tag: 'Softening', level: 1, advice: 'Prices are slipping. Push for lower rates at renewal and avoid long fixed price commitments.' },
  { min: -Infinity, tag: "Buyer's market", level: 0, advice: 'Prices are falling. Press for rebates, shorter terms and volume flexibility.' },
]

export function describeCondition(name, drivers, driverSeries) {
  const usable = driverSeries.filter(Boolean)
  if (!usable.length) return null
  const ch3 = usable.map((s) => pctChange(s, 63))
  const ch12 = usable.map((s) => pctChange(s, 252))
  const avg3 = ch3.reduce((a, b) => a + b, 0) / ch3.length
  const avg12 = ch12.reduce((a, b) => a + b, 0) / ch12.length
  const vol = usable.reduce((a, s) => a + volatility(s), 0) / usable.length
  const tag = TAGS.find((t) => avg3 >= t.min)
  const volLabel = vol > 45 ? 'high' : vol > 22 ? 'moderate' : 'low'
  let lead = null
  usable.forEach((s, i) => {
    if (!lead || Math.abs(ch3[i]) > Math.abs(lead.ch)) lead = { sym: drivers[i], ch: ch3[i] }
  })
  const dir = (x) => (x >= 0 ? 'up' : 'down')
  const f = (x) => `${Math.abs(x).toFixed(1)}%`
  const leadName = lead ? SYMBOLS[lead.sym]?.name || lead.sym : ''
  const parts = [
    `${name} price drivers are ${dir(avg3)} ${f(avg3)} over three months and ${dir(avg12)} ${f(avg12)} over twelve.`,
    usable.length > 1 ? `${leadName} moved the most (${lead.ch >= 0 ? '+' : '-'}${f(lead.ch)}).` : '',
    `Volatility is ${volLabel}.`,
    tag.advice,
  ]
  return { tag: tag.tag, level: tag.level, summary: parts.filter(Boolean).join(' '), avg3, avg12, vol, volLabel }
}

export const fmtPrice = (n) => {
  if (n == null || Number.isNaN(n)) return '-'
  if (Math.abs(n) >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (Math.abs(n) >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
}

export const fmtPct = (n, digits = 2) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`

export const fmtTick = (n, span) => {
  if (span >= 1000) return Math.round(n).toLocaleString('en-US')
  if (span >= 20) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (span >= 2) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
