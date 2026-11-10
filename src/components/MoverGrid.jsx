import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../lib/DataContext'
import { marketMovers } from '../lib/market'

const NEUTRAL = [233, 227, 208] // bone, close to the page background
const GREEN = [31, 154, 101]
const PURPLE = [74, 29, 110]

const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t))

// Shade runs from bone at no change to full green or purple at the biggest move on the grid.
function shade(ch, max) {
  const t = Math.min(1, Math.abs(ch) / max)
  const rgb = mix(NEUTRAL, ch >= 0 ? GREEN : PURPLE, 0.18 + 0.82 * t)
  return { background: `rgb(${rgb.join(',')})`, color: t > 0.4 ? '#fff' : 'var(--ink)' }
}

export default function MoverGrid() {
  const { get, status } = useData()
  const m = useMemo(() => marketMovers(get), [get])
  if (status === 'loading') return <div className="mover-grid skeleton-grid" />
  if (!m.tiles.length) return <p className="note">Prices are unavailable right now, so there are no movers to show.</p>
  const max = Math.max(0.5, ...m.tiles.map((t) => Math.abs(t.ch)))
  return (
    <>
      <div className="mover-grid">
        {m.tiles.map((t) => (
          <Link key={t.kind + t.label} to={t.to} className="tile" style={shade(t.ch, max)} title={`${t.name}, ${t.kind}`}>
            <span className="tile-label">{t.label}</span>
            <span className="tile-sub">{t.kind === 'Stock' ? t.name : t.kind}</span>
            <span className="tile-ch">
              {t.ch >= 0 ? '+' : '-'}
              {Math.abs(t.ch).toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
      <div className="grid-note">
        <span className="legend">
          <i className="swatch down" /> down
          <i className="swatch flat" /> flat
          <i className="swatch up" /> up
        </span>
        <span>The biggest 1 day moves across category indexes, commodities and supplier stocks.</span>
      </div>
    </>
  )
}
