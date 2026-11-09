// Monthly national average truckload rates from DAT's public news releases.
// Each release lists spot and contract rates (per mile, including fuel) for van, reefer and flatbed.
const BASE = 'https://www.dat.com'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

const toText = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')

const EQ = { 'dry van': 'van', van: 'van', reefer: 'reefer', flatbed: 'flatbed' }

// Pulls spot and contract all-in rates out of a release's text.
export function parseRates(text) {
  const spot = {}
  const contract = {}
  // Pattern 1: "Spot van rate: $3.01 per mile" or "Contract reefer rate: $3.29 per mile"
  const p1 = /(spot|contract)\s+(van|reefer|flatbed)\s+rate:\s*\$(\d\.\d\d)\s*(?:a|per)\s*mile/gi
  for (const m of text.matchAll(p1)) {
    const target = m[1].toLowerCase() === 'spot' ? spot : contract
    target[EQ[m[2].toLowerCase()]] ??= Number(m[3])
  }
  // Pattern 2: "Dry van: $3.01 a mile" listed under a paragraph that mentions spot or contract rates.
  const p2 = /(dry van|van|reefer|flatbed):\s*\$(\d\.\d\d)\s*(?:a|per)\s*mile/gi
  let kind = null
  let prevEnd = 0
  for (const m of text.matchAll(p2)) {
    const between = text.slice(prevEnd, m.index)
    const hits = [...between.matchAll(/\b(spot|contract)\b/gi)]
    if (hits.length) kind = hits[hits.length - 1][1].toLowerCase()
    prevEnd = m.index + m[0].length
    if (!kind) continue
    const target = kind === 'spot' ? spot : contract
    target[EQ[m[1].toLowerCase()]] ??= Number(m[2])
  }
  const full = (o) => o.van != null && o.reefer != null && o.flatbed != null
  return full(spot) && full(contract) ? { spot, contract } : null
}

const monthBefore = (iso) => {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 1)
  return d.toISOString().slice(0, 7)
}

async function getText(url) {
  const r = await fetch(url, { headers: HEADERS })
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  return r.text()
}

export default async function handler(req, res) {
  try {
    const pages = await Promise.all(
      [`${BASE}/company/news-events/news-releases`, `${BASE}/company/news-events/news-releases/page/2`, `${BASE}/company/news-events/news-releases/page/3`].map((u) =>
        getText(u).catch(() => ''),
      ),
    )
    const slugs = [
      ...new Set(
        pages.flatMap((h) => [...h.matchAll(/href="(https:\/\/www\.dat\.com\/company\/news-events\/news-releases\/[a-z0-9-]+)"/g)].map((m) => m[1])),
      ),
    ].filter((u) => /truckload|spot|contract|rates|volume|van|reefer|flatbed|diesel|freight/i.test(u))

    const releases = await Promise.all(
      slugs.slice(0, 30).map(async (url) => {
        try {
          const raw = await getText(url)
          const text = toText(raw)
          const dm = text.match(/\b(\d{2})\/(\d{2})\/(20\d\d)\b/)
          if (!dm) return null
          const date = `${dm[3]}-${dm[1]}-${dm[2]}`
          const rates = parseRates(text)
          if (!rates) return null
          const title = (raw.match(/<title>([^<]+)<\/title>/) || ['', ''])[1].replace(/&#8217;|&rsquo;/g, "'").replace(/&amp;/g, '&').replace(/\s*[-|]\s*DAT\s*$/, '').trim()
          return { month: monthBefore(date), date, url, title, ...rates }
        } catch {
          return null
        }
      }),
    )
    const byMonth = new Map()
    releases
      .filter(Boolean)
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((r) => !byMonth.has(r.month) && byMonth.set(r.month, r))
    const months = [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month))
    res.setHeader('Cache-Control', months.length ? 's-maxage=21600, stale-while-revalidate=86400' : 's-maxage=60')
    res.status(200).json({ months })
  } catch (e) {
    res.status(502).json({ error: String(e.message || e), months: [] })
  }
}
