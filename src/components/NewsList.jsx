import { useState } from 'react'
import { useNews, timeAgo } from '../lib/useNews'

function Photo({ src, className }) {
  const [bad, setBad] = useState(false)
  if (!src || bad) return null
  return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={className} onError={() => setBad(true)} />
}

const meta = (n) => `${n.source}${n.date ? ` · ${timeAgo(n.date)}` : ''}`

// lead: show the best story with a photo as a large card at the top.
export default function NewsList({ query, limit = 10, compact = false, partners, kw, lead = false }) {
  const { loading, items, error } = useNews(query, limit, { partners, kw })
  if (loading) {
    return (
      <ul className="news-list">
        {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
          <li key={i} className="skeleton" />
        ))}
      </ul>
    )
  }
  if (error) return <p className="note">{error} Headlines load through the /api/news function once the site is deployed or run with npm run dev.</p>

  // Pick the first story with a photo from the top few as the lead.
  const leadIdx = lead ? Math.max(0, items.slice(0, 6).findIndex((n) => n.image)) : -1
  const first = leadIdx >= 0 && items[leadIdx]?.image ? items[leadIdx] : null
  const rest = first ? items.filter((_, i) => i !== leadIdx) : items

  return (
    <div>
      {first && (
        <a href={first.link} target="_blank" rel="noreferrer" className="lead-card">
          <Photo src={first.image} className="lead-img" />
          <span className="lead-title">{first.title}</span>
          <span className="n-meta">{meta(first)}</span>
        </a>
      )}
      <ul className="news-list">
        {rest.map((n, i) => (
          <li key={i}>
            <a href={n.link} target="_blank" rel="noreferrer" className="news-item">
              <span className="news-text">
                <span className="n-title">{n.title}</span>
                <span className="n-meta">{meta(n)}</span>
              </span>
              <Photo src={n.image} className="news-thumb" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
