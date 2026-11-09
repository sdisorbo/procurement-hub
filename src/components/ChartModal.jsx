import { useEffect, useMemo, useRef, useState } from 'react'
import { RANGES, sliceRange, periodChange, fmtPrice, fmtPct, fmtTick } from '../lib/series'

function useWidth(ref) {
  const [w, setW] = useState(720)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.floor(e.contentRect.width))))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return w
}

const niceDate = (s) =>
  new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit', timeZone: 'UTC' })

export default function ChartModal({ title, subtitle, series, unit, onClose, children, initialRange = '6M' }) {
  const [range, setRange] = useState(initialRange)
  const [hover, setHover] = useState(null)
  const wrap = useRef(null)
  const width = useWidth(wrap)
  const height = width < 520 ? 260 : 340

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const s = useMemo(() => sliceRange(series, range), [series, range])
  const change = periodChange(s)
  const up = change >= 0
  const color = up ? 'var(--pos)' : 'var(--neg)'

  const m = { t: 12, r: 12, b: 26, l: 52 }
  const iw = width - m.l - m.r
  const ih = height - m.t - m.b
  const min = Math.min(...s.v)
  const max = Math.max(...s.v)
  const padV = (max - min) * 0.08 || 1
  const lo = min - padV
  const hi = max + padV
  const x = (i) => m.l + (i / Math.max(1, s.v.length - 1)) * iw
  const y = (v) => m.t + (1 - (v - lo) / (hi - lo)) * ih
  const line = s.v.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${m.l},${m.t + ih} ${line} ${m.l + iw},${m.t + ih}`
  const yTicks = [0, 1, 2, 3, 4].map((k) => lo + ((hi - lo) * k) / 4)
  const xTicks = [0, 0.33, 0.66, 1].map((f) => Math.round(f * (s.v.length - 1)))

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left
    const i = Math.round(((px - m.l) / iw) * (s.v.length - 1))
    setHover(Math.max(0, Math.min(s.v.length - 1, i)))
  }

  const shown = hover ?? s.v.length - 1

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-stats">
          <div className="big-num">
            {fmtPrice(s.v[shown])} <span className="muted unit">{unit}</span>
          </div>
          <div className={`pill ${up ? 'pos' : 'neg'}`}>{fmtPct(change)}</div>
          <span className="muted">{niceDate(s.d[shown])}</span>
        </div>
        <div className="seg">
          {RANGES.map((r) => (
            <button key={r.id} className={r.id === range ? 'on' : ''} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <div ref={wrap} className="chart-wrap">
          <svg
            width={width}
            height={height}
            onMouseMove={onMove}
            onTouchMove={onMove}
            onMouseLeave={() => setHover(null)}
            onTouchEnd={() => setHover(null)}
          >
            <defs>
              <linearGradient id="big-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {yTicks.map((t, i) => (
              <g key={i}>
                <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} className="grid" />
                <text x={m.l - 8} y={y(t) + 4} textAnchor="end" className="axis">
                  {fmtTick(t, hi - lo)}
                </text>
              </g>
            ))}
            {xTicks.map((i, k) => (
              <text
                key={k}
                x={x(i)}
                y={height - 6}
                textAnchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'}
                className="axis"
              >
                {niceDate(s.d[i])}
              </text>
            ))}
            <polygon points={area} fill="url(#big-fill)" />
            <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} className="cross" />
                <circle cx={x(hover)} cy={y(s.v[hover])} r="4.5" fill={color} stroke="var(--bg)" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>
        {series.total > series.members && (
          <p className="note">{series.total - series.members} of {series.total} companies are left out because their price did not load.</p>
        )}
        {children}
      </div>
    </div>
  )
}
