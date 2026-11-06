import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ALL_SYMBOLS } from '../data/categories'
import { sampleSeries } from './series'

const Ctx = createContext(null)

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

export function DataProvider({ children }) {
  const [live, setLive] = useState({})
  const [status, setStatus] = useState('loading') // loading | live | partial | sample

  useEffect(() => {
    let cancelled = false
    async function run() {
      const got = {}
      await Promise.all(
        chunk(ALL_SYMBOLS, 25).map(async (group) => {
          try {
            const r = await fetch(`/api/quotes?symbols=${encodeURIComponent(group.join(','))}`)
            if (!r.ok) return
            const j = await r.json()
            Object.entries(j.series || {}).forEach(([k, v]) => {
              if (v.v.length > 20) got[k] = v
            })
          } catch {
            /* fall through to sample data */
          }
        }),
      )
      if (cancelled) return
      setLive(got)
      const n = Object.keys(got).length
      setStatus(n === 0 ? 'sample' : n < ALL_SYMBOLS.length ? 'partial' : 'live')
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    const cache = {}
    const get = (sym) => {
      if (live[sym]) return live[sym]
      if (!cache[sym]) cache[sym] = sampleSeries(sym)
      return cache[sym]
    }
    return { get, status, liveCount: Object.keys(live).length }
  }, [live, status])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
