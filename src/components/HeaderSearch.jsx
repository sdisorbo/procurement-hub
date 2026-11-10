import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchInput from './SearchInput'
import { SEARCH_ITEMS, matches } from '../lib/searchIndex'

// Site wide search that lives in the header. Finds categories, category indexes and benchmarks.
export default function HeaderSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const box = useRef(null)

  const results = useMemo(() => (q.trim() ? SEARCH_ITEMS.filter((i) => matches(q, i.text)).slice(0, 8) : []), [q])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const away = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [])

  const go = (to) => {
    nav(to)
    setQ('')
    setOpen(false)
    if (document.activeElement) document.activeElement.blur()
  }

  return (
    <div className="hsearch" ref={box} onFocus={() => setOpen(true)}>
      <SearchInput
        value={q}
        onChange={(v) => {
          setQ(v)
          setOpen(true)
        }}
        placeholder="Search categories or tickers"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].to)
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && q.trim() && (
        <ul className="results">
          {results.length ? (
            results.map((r) => (
              <li key={r.type + r.label}>
                <button onClick={() => go(r.to)}>
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
