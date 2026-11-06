// Pulls headlines from Google News RSS for a search query. No API key needed.
const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim()

const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? decode(m[1]) : ''
}

export default async function handler(req, res) {
  const q = String(req.query.q || 'procurement sourcing').slice(0, 300)
  const limit = Math.min(Number(req.query.limit) || 15, 30)
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=en-US&gl=US&ceid=US:en`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (procurement-hub)' } })
    if (!r.ok) throw new Error(`upstream ${r.status}`)
    const xml = await r.text()
    const items = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, limit).map((it) => {
      const raw = pick(it, 'title')
      const source = pick(it, 'source')
      const title = source && raw.endsWith(` - ${source}`) ? raw.slice(0, -(source.length + 3)) : raw
      return {
        title,
        source: source || 'News',
        link: pick(it, 'link'),
        date: pick(it, 'pubDate'),
      }
    })
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    res.status(200).json({ items })
  } catch (err) {
    res.status(502).json({ error: String(err.message || err), items: [] })
  }
}
