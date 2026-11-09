import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useData } from '../lib/DataContext'
import { buildIndex, fmtPrice } from '../lib/series'
import Sparkline from './Sparkline'

const BENCH = ['^GSPC', 'CL=F', 'HO=F', 'NG=F', 'HG=F', 'ALI=F', 'LBR=F', 'HRC=F', 'ZC=F', 'ZW=F', 'KC=F', 'BDRY', '^TNX', 'DX-Y.NYB']
const SHORT = { '^GSPC': 'S&P 500', 'CL=F': 'WTI', 'HO=F': 'DIESEL', 'NG=F': 'NAT GAS', 'HG=F': 'COPPER', 'ALI=F': 'ALUMINUM', 'LBR=F': 'LUMBER', 'HRC=F': 'STEEL HRC', 'ZC=F': 'CORN', 'ZW=F': 'WHEAT', 'KC=F': 'COFFEE', BDRY: 'DRY BULK', '^TNX': '10Y YIELD', 'DX-Y.NYB': 'USD INDEX' }

// 1 day change: latest point against the one before it.
const dayChange = (s) => (s && s.v.length > 1 ? (s.v[s.v.length - 1] / s.v[s.v.length - 2] - 1) * 100 : null)

function Item({ it }) {
  const up = it.ch >= 0
  return (
    <Link to={it.to} className="tick" title={`${it.name}, 1 day change`}>
      <span className="tick-sym">{it.label}</span>
      <Sparkline values={it.spark} up={up} width={52} height={20} />
      <span className="tick-val">{fmtPrice(it.value)}</span>
      <span className={up ? 'posText tick-ch' : 'negText tick-ch'}>
        {up ? '▲' : '▼'} {Math.abs(it.ch).toFixed(2)}%
      </span>
    </Link>
  )
}

export default function Ticker() {
  const { get, status, updatedAt } = useData()

  const items = useMemo(() => {
    const out = []
    const idx = CATEGORIES.map((c) => ({ c, s: buildIndex(c.basket.map((b) => get(b))) }))
    const all = buildIndex(idx.map((x) => x.s))
    const push = (label, name, s, to) => {
      const ch = dayChange(s)
      if (ch == null) return
      out.push({ label, name, to, ch, value: s.v[s.v.length - 1], spark: s.v.slice(-30) })
    }
    push('PROC ALL', 'All category indexes combined', all, '/indexes?q=proc')
    idx.forEach(({ c, s }) => push(c.name.toUpperCase(), `${c.name} supplier index`, s, `/categories/${c.id}`))
    BENCH.forEach((sym) => push(SHORT[sym] || sym, SYMBOLS[sym]?.name || sym, get(sym), `/indexes?q=${encodeURIComponent(sym)}`))
    return out
  }, [get, updatedAt])

  if (status === 'loading') return <div className="ticker ticker-msg">Loading prices</div>
  if (!items.length) return <div className="ticker ticker-msg">Prices are unavailable right now.</div>

  // The list is shown twice so the loop has no gap. Roughly 6 seconds per item keeps it slow.
  return (
    <div className="ticker" role="region" aria-label="Index ticker">
      <div className="ticker-track" style={{ animationDuration: `${items.length * 6}s` }}>
        {[0, 1].map((n) => (
          <div className="ticker-set" key={n} aria-hidden={n === 1}>
            {items.map((it) => (
              <Item key={it.label} it={it} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
