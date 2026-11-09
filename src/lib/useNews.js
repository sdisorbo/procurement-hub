import { useEffect, useState } from 'react'

const cache = new Map()

export function useNews(query, limit = 12, opts = {}) {
  const partners = opts.partners || ''
  const kw = (opts.kw || []).join(',')
  const key = `${query}|${limit}|${partners}|${kw}`
  const [state, setState] = useState(() => cache.get(key) || { loading: true, items: [], error: null })

  useEffect(() => {
    if (cache.has(key)) {
      setState(cache.get(key))
      return
    }
    let cancelled = false
    setState({ loading: true, items: [], error: null })
    const extra = `${partners ? `&partners=${partners}` : ''}${kw ? `&kw=${encodeURIComponent(kw)}` : ''}`
    fetch(`/api/news?q=${encodeURIComponent(query)}&limit=${limit}${extra}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        const next = { loading: false, items: j.items || [], error: ok && j.items?.length ? null : 'No headlines came back.' }
        if (ok && next.items.length) cache.set(key, next)
        if (!cancelled) setState(next)
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, items: [], error: 'Could not reach the news feed.' })
      })
    return () => {
      cancelled = true
    }
  }, [key, query, limit, partners, kw])

  return state
}

export const timeAgo = (dateStr) => {
  const t = new Date(dateStr).getTime()
  if (!t) return ''
  const h = Math.round((Date.now() - t) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
