import { useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'

const W = 960
const H = 500
const projection = geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' })
const path = geoPath(projection)
const land = feature(world, world.objects.countries)

export default function SupplierMap({ suppliers }) {
  const [active, setActive] = useState(null)
  const countries = useMemo(() => land.features.map((f, i) => <path key={i} d={path(f) || ''} className="land" />), [])
  const dots = suppliers.map((s) => ({ s, p: projection([s[4], s[3]]) }))
  const a = active != null ? dots[active] : null

  // Zoom to the area the suppliers sit in, keeping the map's aspect ratio.
  const xs = dots.map((d) => d.p[0])
  const ys = dots.map((d) => d.p[1])
  let vw = Math.max(460, (Math.max(...xs) - Math.min(...xs)) * 1.35 + 120)
  vw = Math.min(W, vw)
  let vh = vw * (H / W)
  const need = (Math.max(...ys) - Math.min(...ys)) * 1.35 + 80
  if (need > vh) {
    vh = Math.min(H, need)
    vw = vh * (W / H)
  }
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2
  const vx = Math.min(W - vw, Math.max(0, cx - vw / 2))
  const vy = Math.min(H - vh, Math.max(0, cy - vh / 2))
  const k = vw / W
  return (
    <div className="map-wrap">
      <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} role="img" aria-label="Supplier headquarters map">
        {countries}
        {dots.map(({ s, p }, i) => (
          <g key={s[0]} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onClick={() => setActive(i)}>
            <circle cx={p[0]} cy={p[1]} r={(active === i ? 11 : 7) * Math.max(0.55, k)} className="dot-halo" />
            <circle cx={p[0]} cy={p[1]} r={4.5 * Math.max(0.55, k)} className="dot" />
          </g>
        ))}
      </svg>
      {a && (
        <div
          className="map-tip"
          style={{ left: `${((a.p[0] - vx) / vw) * 100}%`, top: `${((a.p[1] - vy) / vh) * 100}%` }}
        >
          <strong>{a.s[0]}</strong>
          <span>
            {a.s[1]}, {a.s[2]}
          </span>
        </div>
      )}
    </div>
  )
}
