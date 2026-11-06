// Daily closes for a list of Yahoo Finance symbols (one year). No API key needed.
// Usage: /api/quotes?symbols=LBR=F,WY,^GSPC
const fetchOne = async (symbol) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (procurement-hub)' } })
  if (!r.ok) throw new Error(`${symbol} ${r.status}`)
  const j = await r.json()
  const result = j?.chart?.result?.[0]
  if (!result) throw new Error(`${symbol} empty`)
  const ts = result.timestamp || []
  const close = result.indicators?.quote?.[0]?.close || []
  const d = []
  const v = []
  ts.forEach((t, i) => {
    if (close[i] == null) return
    d.push(new Date(t * 1000).toISOString().slice(0, 10))
    v.push(Math.round(close[i] * 10000) / 10000)
  })
  return { d, v, currency: result.meta?.currency || '' }
}

export default async function handler(req, res) {
  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40)
  const out = {}
  await Promise.all(
    symbols.map(async (s) => {
      try {
        out[s] = await fetchOne(s)
      } catch {
        /* skipped; the client fills gaps with sample data */
      }
    }),
  )
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
  res.status(200).json({ series: out })
}
