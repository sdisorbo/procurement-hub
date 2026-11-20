// Series from FRED through its public CSV download, which needs no API key.
//   /api/fred?ids=APU0000FF1101,WPU081
// Monthly series return five years, daily and weekly series return about two.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/csv,*/*',
}

const yearsAgo = (n) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return d.toISOString().slice(0, 10)
}

// Median gap between observations in days, used to tell monthly series from daily and weekly ones.
const medianGap = (dates) => {
  const gaps = []
  for (let i = 1; i < dates.length; i++) gaps.push((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000)
  gaps.sort((a, b) => a - b)
  return gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0
}

async function one(id) {
  const base = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}`
  // Try the long window first. Daily series are cut to two years on a second try if the first fails.
  const r = await fetch(`${base}&cosd=${yearsAgo(5)}`, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const lines = (await r.text()).trim().split('\n').slice(1)
  const d = []
  const v = []
  for (const line of lines) {
    const [date, val] = line.split(',')
    const n = Number(val)
    if (!date || val === '.' || val === '' || !Number.isFinite(n)) continue
    d.push(date)
    v.push(n)
  }
  if (d.length < 3) throw new Error('no data')
  // Keep daily series to roughly two years so the response stays small.
  const monthly = medianGap(d) > 20
  const cut = monthly ? 0 : Math.max(0, d.length - 520)
  return { d: d.slice(cut), v: v.slice(cut), monthly }
}

export default async function handler(req, res) {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z0-9_]{2,30}$/.test(s))
    .slice(0, 40)
  const series = {}
  const errors = {}
  await Promise.all(
    ids.map(async (id) => {
      try {
        series[id] = await one(id)
      } catch (e) {
        errors[id] = String(e.message || e)
      }
    }),
  )
  const ok = Object.keys(series).length === ids.length
  res.setHeader('Cache-Control', ok ? 's-maxage=21600, stale-while-revalidate=86400' : 's-maxage=60')
  res.status(200).json({ series, errors })
}
