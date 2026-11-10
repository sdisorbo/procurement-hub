// Prices from Yahoo Finance through the yahoo-finance2 package, which handles Yahoo's cookie and crumb checks.
// History:  /api/quotes?symbols=WY,LBR=F
// Latest:   /api/quotes?live=1&symbols=WY,LBR=F
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const parseList = (q) =>
  String(q || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40)

async function history(symbol) {
  const start = new Date()
  start.setFullYear(start.getFullYear() - 1)
  const r = await yf.chart(symbol, { period1: start, interval: '1d' })
  const d = []
  const v = []
  const vol = []
  for (const row of r.quotes || []) {
    if (row.close == null || !row.date) continue
    d.push(new Date(row.date).toISOString().slice(0, 10))
    v.push(Math.round(row.close * 10000) / 10000)
    vol.push(row.volume ?? 0)
  }
  if (d.length < 5) throw new Error('no data')
  return { d, v, vol, currency: r.meta?.currency || '' }
}

export default async function handler(req, res) {
  const symbols = parseList(req.query.symbols)
  const errors = {}

  if (req.query.live) {
    const prices = {}
    try {
      // One batched call for all symbols.
      const rows = await yf.quote(symbols, {}, { validateResult: false })
      for (const q of rows) {
        if (q?.regularMarketPrice == null) continue
        prices[q.symbol] = {
          price: q.regularMarketPrice,
          volume: q.regularMarketVolume ?? null,
          time: q.regularMarketTime ? new Date(q.regularMarketTime).toISOString() : null,
        }
      }
    } catch (e) {
      errors._batch = String(e.message || e)
    }
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=60')
    return res.status(200).json({ prices, errors, at: new Date().toISOString() })
  }

  const out = {}
  await Promise.all(
    symbols.map(async (s) => {
      try {
        out[s] = await history(s)
      } catch (e) {
        errors[s] = String(e.message || e)
      }
    }),
  )
  const ok = Object.keys(out).length === symbols.length
  res.setHeader('Cache-Control', ok ? 's-maxage=900, stale-while-revalidate=3600' : 's-maxage=30')
  res.status(200).json({ series: out, errors })
}
