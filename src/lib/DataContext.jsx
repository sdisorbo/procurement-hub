import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ALL_SYMBOLS } from '../data/categories'

const Ctx = createContext(null)

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

export function DataProvider({ children }) {
  const [live, setLive] = useState({})
  const [status, setStatus] = useState('loading') // loading | live | partial | none
  const [ticks, setTicks] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)

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
            /* symbol stays unavailable */
          }
        }),
      )
      if (cancelled) return
      setLive(got)
      const n = Object.keys(got).length
      setStatus(n === 0 ? 'none' : n < ALL_SYMBOLS.length ? 'partial' : 'live')
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  // Refresh latest prices every minute while the tab is visible.
  useEffect(() => {
    let stop = false
    async function poll() {
      if (document.hidden) return
      const next = {}
      await Promise.all(
        chunk(ALL_SYMBOLS, 20).map(async (group) => {
          try {
            const r = await fetch(`/api/quotes?live=1&symbols=${encodeURIComponent(group.join(','))}`)
            if (!r.ok) return
            const j = await r.json()
            Object.assign(next, j.prices || {})
          } catch {
            /* try again next minute */
          }
        }),
      )
      if (stop || !Object.keys(next).length) return
      setTicks((t) => ({ ...t, ...next }))
      setUpdatedAt(new Date())
    }
    const first = setTimeout(poll, 3000)
    const id = setInterval(poll, 60000)
    const onVis = () => !document.hidden && poll()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop = true
      clearTimeout(first)
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const value = useMemo(() => {
    const get = (sym) => {
      if (live[sym]) {
        const t = ticks[sym]
        if (!t) return live[sym]
        // Put the latest tick on the end of the daily series.
        const base = live[sym]
        const day = (t.time || new Date().toISOString()).slice(0, 10)
        const d = [...base.d]
        const v = [...base.v]
        if (d[d.length - 1] === day) v[v.length - 1] = t.price
        else if (day > d[d.length - 1]) {
          d.push(day)
          v.push(t.price)
        }
        return { ...base, d, v }
      }
      return null
    }
    return { get, status, updatedAt, liveCount: Object.keys(live).length }
  }, [live, ticks, status, updatedAt])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useData = () => useContext(Ctx)
