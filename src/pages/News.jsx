import { useMemo, useState } from 'react'
import { useNews, timeAgo } from '../lib/useNews'
import NewsList from '../components/NewsList'
import HomeSearch from '../components/HomeSearch'

const TOPICS = [
  { id: 'all', label: 'All', q: 'procurement OR strategic sourcing OR "supply chain" purchasing' },
  { id: 'sourcing', label: 'Sourcing and suppliers', q: 'strategic sourcing OR supplier negotiations OR supplier risk' },
  { id: 'trade', label: 'Tariffs and trade', q: 'tariffs imports trade policy supply chain' },
  { id: 'logistics', label: 'Logistics', q: 'freight rates OR port congestion OR logistics costs' },
  { id: 'commodities', label: 'Commodities', q: 'commodity prices raw materials costs' },
  { id: 'risk', label: 'Supply chain risk', q: 'supply chain disruption shortage' },
]

const BRIEF_SOURCES = [TOPICS[0].q, TOPICS[2].q, TOPICS[4].q, TOPICS[5].q]

function DailyBrief() {
  const a = useNews(BRIEF_SOURCES[0], 8)
  const b = useNews(BRIEF_SOURCES[1], 8)
  const c = useNews(BRIEF_SOURCES[2], 8)
  const d = useNews(BRIEF_SOURCES[3], 8)
  const loading = a.loading || b.loading || c.loading || d.loading

  const items = useMemo(() => {
    const seen = new Set()
    const pools = [a.items, b.items, c.items, d.items]
    const out = []
    // Take the newest headline from each topic first, then fill from the rest.
    for (let round = 0; round < 3; round++) {
      pools.forEach((p) => {
        const n = p[round]
        if (!n) return
        const key = n.title.toLowerCase().slice(0, 40)
        if (seen.has(key)) return
        seen.add(key)
        out.push(n)
      })
    }
    return out.slice(0, 6)
  }, [a.items, b.items, c.items, d.items])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <section className="brief">
      <div className="brief-head">
        <h2>Today's brief</h2>
        <span className="muted">{today}</span>
      </div>
      {loading ? (
        <ul className="brief-list">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="skeleton" />
          ))}
        </ul>
      ) : items.length ? (
        <ul className="brief-list">
          {items.map((n, i) => (
            <li key={i}>
              <a href={n.link} target="_blank" rel="noreferrer">
                {n.title}
              </a>
              <span className="muted"> {n.source}, {timeAgo(n.date)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="note">Headlines did not load. They come from the /api/news function, which runs on Vercel or with npm run dev.</p>
      )}
    </section>
  )
}

export default function News() {
  const [topic, setTopic] = useState('all')
  const t = TOPICS.find((x) => x.id === topic)
  return (
    <div className="page">
      <h1>News</h1>
      <p className="lede">Sourcing and procurement headlines, refreshed every 15 minutes.</p>
      <HomeSearch />
      <DailyBrief />
      <div className="chips">
        {TOPICS.map((x) => (
          <button key={x.id} className={x.id === topic ? 'on' : ''} onClick={() => setTopic(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <NewsList key={topic} query={t.q} limit={20} />
    </div>
  )
}
