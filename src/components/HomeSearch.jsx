import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchInput from './SearchInput'
import { SEARCH_ITEMS, matches } from '../lib/searchIndex'

export default function HomeSearch() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const results = useMemo(
    () => (q.trim() ? SEARCH_ITEMS.filter((i) => matches(q, i.text)).slice(0, 8) : []),
    [q],
  )
  return (
    <div className="home-search">
      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Search categories and indexes"
        onKeyDown={(e) => e.key === 'Enter' && results[0] && nav(results[0].to)}
      />
      {q.trim() && (
        <ul className="results">
          {results.length ? (
            results.map((r) => (
              <li key={r.type + r.label}>
                <button onClick={() => nav(r.to)}>
                  <span className="r-type">{r.type}</span>
                  <span className="r-label">{r.label}</span>
                  <span className="muted r-sub">{r.sub}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="none muted">No match</li>
          )}
        </ul>
      )}
    </div>
  )
}
