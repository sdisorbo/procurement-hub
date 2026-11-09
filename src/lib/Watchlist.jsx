import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Keys look like cat:lumber (a category and its supplier index) or sym:CL=F (a market symbol).
const KEY = 'proc-watchlist'

const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const save = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage can be blocked in private mode, the list then lasts for this visit only */
  }
}

const Ctx = createContext(null)

export function WatchlistProvider({ children }) {
  const [list, setList] = useState(load)
  const toggle = useCallback((key) => {
    setList((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      save(next)
      return next
    })
  }, [])
  const value = useMemo(() => ({ list, toggle, has: (k) => list.includes(k) }), [list, toggle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useWatchlist = () => useContext(Ctx)
