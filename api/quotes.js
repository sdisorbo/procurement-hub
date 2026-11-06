// Daily closes for a list of Yahoo Finance symbols (one year). No API key needed.
// Usage: /api/quotes?symbols=LBR=F,WY,^GSPC
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json,text/plain,*/*',
}

// Tries both Yahoo hosts, since one is sometimes rate limited when the other is not.
const yahoo = async (symbol, query) => {
  let lastErr
  for (const host of ['query1', 'query2']) {
    try {
      const r = await fetch(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${query}`, { headers: HEADERS })
      if (r.ok) return await r.json()
      lastErr = new Error(`${symbol} HTTP ${r.status}`)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

const fetchOne = async (symbol) => {
  const j = await yahoo(symbol, 'range=1y&interval=1d')
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

// Latest price for one symbol, plus the previous close.
const fetchLive = async (symbol) => {
  const j = await yahoo(symbol, 'range=1d&interval=1m')
  const m = j?.chart?.result?.[0]?.meta
  if (!m || m.regularMarketPrice == null) throw new Error(`${symbol} empty`)
  return {
    price: m.regularMarketPrice,
    time: m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toISOString() : null,
  }
}

export default async function handler(req, res) {
  if (req.query.live) {
    const list = String(req.query.symbols || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 40)
    const prices = {}
    await Promise.all(
      list.map(async (sym) => {
        try {
          prices[sym] = await fetchLive(sym)
        } catch {
          /* skipped */
        }
      }),
    )
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=60')
    return res.status(200).json({ prices, at: new Date().toISOString() })
  }

  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40)
  const out = {}
  const errors = {}
  await Promise.all(
    symbols.map(async (s) => {
      try {
        out[s] = await fetchOne(s)
      } catch (e) {
        errors[s] = String(e.message || e)
      }
    }),
  )
  // Failed lookups are not cached for long, so a bad minute does not stick.
  const ok = Object.keys(out).length === symbols.length
  res.setHeader('Cache-Control', ok ? 's-maxage=900, stale-while-revalidate=3600' : 's-maxage=30')
  res.status(200).json({ series: out, errors })
}
