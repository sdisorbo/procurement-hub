import { SYMBOLS } from '../data/symbols'

export const RANGES = [
  { id: '1M', label: '1M', n: 22 },
  { id: '3M', label: '3M', n: 64 },
  { id: '6M', label: '6M', n: 127 },
  { id: '1Y', label: '1Y', n: 400 },
]

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
  if (!valid.length) return null
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
  return { d: useDates, v, members: valid.length, total: seriesList.length }
}

const TAGS = [
  { min: 8, tag: "Seller's market", level: 4, advice: 'Prices are high and climbing. Lock volume early, widen the supplier list, and expect pushback on payment terms.' },
  { min: 3, tag: 'Firming', level: 3, advice: 'Prices are edging up. Consider layering in forward cover and test index linked pricing.' },
  { min: -3, tag: 'Balanced', level: 2, advice: 'Prices are flat. A good window to renegotiate terms, qualify a second source, or simplify specs.' },
  { min: -8, tag: 'Softening', level: 1, advice: 'Prices are slipping. Push for lower rates at renewal and avoid long fixed price commitments.' },
  { min: -Infinity, tag: "Buyer's market", level: 0, advice: 'Prices are falling. Press for rebates, shorter terms and volume flexibility.' },
]

// Change over a number of calendar days, found by date so daily and monthly series both work.
export function changeOver(s, days) {
  const n = s.d.length
  if (n < 2) return null
  const end = new Date(s.d[n - 1] + 'T12:00:00Z')
  const first = new Date(s.d[0] + 'T12:00:00Z')
  if ((end - first) / 86400000 < days * 0.7) return null
  const target = new Date(end)
  target.setUTCDate(target.getUTCDate() - days)
  const t = target.toISOString().slice(0, 10)
  let i = 0
  for (let k = n - 1; k >= 0; k--) {
    if (s.d[k] <= t) {
      i = k
      break
    }
  }
  return (s.v[n - 1] / s.v[i] - 1) * 100
}

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)

// drivers: [{ label, series }]. kind 'stocks' means the drivers are equity prices, so the read is about sentiment.
export function describeCondition(name, drivers, { kind = 'prices' } = {}) {
  const rows = drivers.filter((d) => d.series)
  if (!rows.length) return null
  const ch3 = rows.map((r) => changeOver(r.series, 91))
  const ch12 = rows.map((r) => changeOver(r.series, 365))
  const avg3 = avg(ch3.filter((x) => x != null))
  const avg12 = avg(ch12.filter((x) => x != null))
  if (avg3 == null && avg12 == null) return null
  // Recent move counts most, but a big move over the year keeps the read from calling an elevated market flat.
  const score = (avg3 ?? 0) + 0.25 * (avg12 ?? 0)
  const tag = TAGS.find((t) => score >= t.min)
  const vols = rows.filter((r) => !r.series.monthly).map((r) => volatility(r.series))
  const vol = avg(vols)
  const volLabel = vol == null ? null : vol > 45 ? 'high' : vol > 22 ? 'moderate' : 'low'

  let lead = null
  rows.forEach((r, i) => {
    if (ch3[i] != null && (!lead || Math.abs(ch3[i]) > Math.abs(lead.ch))) lead = { label: r.label, ch: ch3[i] }
  })
  const dir = (x) => (x >= 0 ? 'up' : 'down')
  const f = (x) => `${Math.abs(x).toFixed(1)}%`
  const subject = kind === 'stocks' ? `${name} supplier stocks are` : `${name} price drivers are`
  const parts = []
  if (avg3 != null && avg12 != null) parts.push(`${subject} ${dir(avg3)} ${f(avg3)} over three months and ${dir(avg12)} ${f(avg12)} over twelve.`)
  else if (avg3 != null) parts.push(`${subject} ${dir(avg3)} ${f(avg3)} over three months.`)
  else parts.push(`${subject} ${dir(avg12)} ${f(avg12)} over twelve months.`)
  if (rows.length > 1 && lead) parts.push(`${lead.label} moved the most over three months (${lead.ch >= 0 ? '+' : '-'}${f(lead.ch)}).`)
  if (volLabel) parts.push(`Volatility is ${volLabel}.`)
  parts.push(kind === 'stocks' ? 'This reads investor sentiment about suppliers, not prices you pay, so check rate cards and quotes before acting on it.' : tag.advice)
  return {
    tag: tag.tag,
    level: tag.level,
    summary: parts.join(' '),
    avg3: avg3 ?? avg12,
    avg12,
    vol,
    volLabel,
    lead,
    kind,
    drivers: rows.map((r) => r.label),
  }
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
