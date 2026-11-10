// Headlines from Google News, plus article feeds from Inverto and GEP.
//   /api/news?q=...&limit=12                       Google News only
//   /api/news?q=...&partners=merge                 Google News plus Inverto and GEP, newest first
//   /api/news?partners=match&kw=lumber,wood&q=...  as above, partner items only when the title has a keyword
//   /api/news?partners=only                        Inverto and GEP only
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
}

const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? decode(m[1]) : ''
}

async function get(url) {
  const r = await fetch(url, { headers: HEADERS })
  if (!r.ok) throw new Error(`${url} ${r.status}`)
  return r.text()
}

async function googleNews(q, limit) {
  const xml = await get(`https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=en-US&gl=US&ceid=US:en`)
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, limit).map((it) => {
    const raw = pick(it, 'title')
    const source = pick(it, 'source')
    const title = source && raw.endsWith(` - ${source}`) ? raw.slice(0, -(source.length + 3)) : raw
    return { title, source: source || 'News', link: pick(it, 'link'), date: pick(it, 'pubDate') }
  })
}

async function inverto() {
  const xml = await get('https://inverto.com/en/insights/feed/')
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((it) => ({
    title: pick(it, 'title'),
    source: 'Inverto',
    link: pick(it, 'link'),
    date: pick(it, 'pubDate'),
  }))
}

// GEP has no feed. Read the blog listing, and take dates from the sitemap (last updated).
async function gep() {
  const [html, sitemap] = await Promise.all([get('https://www.gep.com/blog/mind'), get('https://www.gep.com/sitemap.xml').catch(() => '')])
  const dates = new Map()
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) dates.set(m[1], m[2])
  const imgs = new Map()
  for (const m of html.matchAll(/<a href="(\/blog\/[^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"/g)) imgs.set(m[1], m[2])
  const seen = new Set()
  const out = []
  for (const m of html.matchAll(/<a href="(\/blog\/[a-z0-9\-/]+)"[^>]*>([^<]{25,220})<\/a>/gi)) {
    if (m[1].includes('/category/') || seen.has(m[1])) continue
    seen.add(m[1])
    const link = `https://www.gep.com${m[1]}`
    const img = imgs.get(m[1])
    out.push({ title: decode(m[2]), source: 'GEP', link, date: dates.get(link) || '', image: img ? `https://www.gep.com${img}` : '' })
  }
  return out
}

// Reads the share image from an article page.
async function ogImage(url) {
  try {
    const r = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(4000) })
    if (!r.ok) return ''
    const html = (await r.text()).slice(0, 60000)
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return m ? decode(m[1]) : ''
  } catch {
    return ''
  }
}

const ts = (d) => new Date(d).getTime() || 0

export default async function handler(req, res) {
  const q = String(req.query.q || 'procurement sourcing').slice(0, 300)
  const limit = Math.min(Number(req.query.limit) || 15, 40)
  const partners = String(req.query.partners || '')
  const kw = String(req.query.kw || '').toLowerCase().split(',').map((x) => x.trim()).filter(Boolean)
  const errors = []
  const run = (p, label) => p.catch((e) => { errors.push(`${label}: ${e.message || e}`); return [] })

  const [google, inv, gp] = await Promise.all([
    partners === 'only' ? [] : run(googleNews(q, limit), 'google'),
    partners ? run(inverto(), 'inverto') : [],
    partners ? run(gep(), 'gep') : [],
  ])
  let extra = [...inv, ...gp]
  if (partners === 'match') extra = extra.filter((n) => kw.some((k) => n.title.toLowerCase().includes(k)))
  const items = [...google, ...extra.sort((a, b) => ts(b.date) - ts(a.date))]
    .sort((a, b) => ts(b.date) - ts(a.date))
    .slice(0, limit)

  // Partner articles get a photo. Google News links do not expose one.
  await Promise.all(items.filter((n) => (n.source === 'Inverto' || n.source === 'GEP') && !n.image).slice(0, 14).map(async (n) => { n.image = await ogImage(n.link) }))

  res.setHeader('Cache-Control', items.length ? 's-maxage=900, stale-while-revalidate=3600' : 's-maxage=30')
  res.status(items.length ? 200 : 502).json({ items, errors })
}
