import { useNews, timeAgo } from '../lib/useNews'

export default function NewsList({ query, limit = 10, compact = false }) {
  const { loading, items, error } = useNews(query, limit)
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
  return (
    <ul className="news-list">
      {items.map((n, i) => (
        <li key={i}>
          <a href={n.link} target="_blank" rel="noreferrer">
            <span className="n-title">{n.title}</span>
            <span className="n-meta">
              {n.source} · {timeAgo(n.date)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
