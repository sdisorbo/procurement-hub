import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../lib/DataContext'
import { marketMovers } from '../lib/market'
import ChartModal from './ChartModal'
import NewsList from './NewsList'

const PAGE = 16
const NEUTRAL = [233, 227, 208] // bone, close to the page background
const GREEN = [31, 154, 101]
const PURPLE = [74, 29, 110]

const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t))

// Shade runs from bone at no change to full green or purple at the biggest move of the day.
function shade(ch, max) {
  const t = Math.min(1, Math.abs(ch) / max)
  const rgb = mix(NEUTRAL, ch >= 0 ? GREEN : PURPLE, 0.18 + 0.82 * t)
  return { background: `rgb(${rgb.join(',')})`, color: t > 0.4 ? '#fff' : 'var(--ink)' }
}

export default function MoverGrid() {
  const { get, status } = useData()
  const [page, setPage] = useState(0)
  const touch = useRef(null)
  const [open, setOpen] = useState(null)
  const m = useMemo(() => marketMovers(get), [get])

  if (status === 'loading') return <div className="mover-grid skeleton-grid" />
  if (!m.tiles.length) return <p className="note">Prices are unavailable right now, so there are no movers to show.</p>

  const pages = Math.ceil(m.tiles.length / PAGE)
  const cur = Math.min(page, pages - 1)
  const go = (n) => setPage(Math.max(0, Math.min(pages - 1, n)))
  // Page 1 holds the biggest moves. Within a page the tiles run from best to worst.
  const shown = m.tiles.slice(cur * PAGE, cur * PAGE + PAGE).sort((a, b) => b.ch - a.ch)
  const max = Math.max(0.5, Math.abs(m.tiles[0].ch)) // one scale for every page, so later pages look paler
  const from = cur * PAGE + 1
  const to = Math.min(m.tiles.length, (cur + 1) * PAGE)

  const onTouchEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1))
  }

  return (
    <>
      <div
        className="mover-grid"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={onTouchEnd}
      >
        {shown.map((t) => (
          <button key={t.kind + t.label} className="tile" style={shade(t.ch, max)} title={`${t.name}, ${t.kind}`} onClick={() => setOpen(t)}>
            <span className="tile-label">{t.label}</span>
            <span className="tile-sub">{t.kind === 'Stock' ? t.name : t.kind}</span>
            <span className="tile-ch">
              {t.ch >= 0 ? '+' : '-'}
              {Math.abs(t.ch).toFixed(2)}%
            </span>
          </button>
        ))}
      </div>

      <div className="pager" role="navigation" aria-label="Movers pages">
        <button onClick={() => go(0)} disabled={cur === 0} aria-label="First page">
          ««
        </button>
        <button onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous page">
          ‹ Prev
        </button>
        <span className="pager-info">
          {from}-{to} of {m.tiles.length}
        </span>
        <button onClick={() => go(cur + 1)} disabled={cur === pages - 1} aria-label="Next page">
          Next ›
        </button>
        <button onClick={() => go(pages - 1)} disabled={cur === pages - 1} aria-label="Last page">
          »»
        </button>
      </div>

      {open && (
        <ChartModal
          title={open.kind === 'Stock' ? `${open.label} · ${open.name}` : open.name}
          subtitle={`${open.kind}, 1 day ${open.ch >= 0 ? '+' : '-'}${Math.abs(open.ch).toFixed(2)}%`}
          series={open.series}
          unit={open.unit}
          onClose={() => setOpen(null)}
        >
          <p className="modal-link">
            <Link to={open.to} onClick={() => setOpen(null)}>
              {open.kind === 'Market' ? 'See it on the Indexes page' : `Open the ${open.cat?.name || ''} page`}
            </Link>
          </p>
          <h4 className="modal-h">Related news</h4>
          <NewsList query={open.query} limit={6} compact partners={open.kind === 'Index' ? 'match' : undefined} kw={open.cat ? [...open.cat.name.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3), ...(open.cat.keywords || [])] : undefined} />
        </ChartModal>
      )}

      <div className="grid-note">
        <span className="legend">
          <i className="swatch down" /> down
          <i className="swatch flat" /> flat
          <i className="swatch up" /> up
        </span>
        <span>
          Page {cur + 1} of {pages}. Page 1 has the biggest 1 day moves across category indexes, commodities and supplier stocks.
        </span>
      </div>
    </>
  )
}
