import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchInput from '../components/SearchInput'
import { matches } from '../lib/searchIndex'
import { CATEGORIES, BENCHMARKS } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useData } from '../lib/DataContext'
import { buildIndex, RANGES } from '../lib/series'
import QuoteRow from '../components/QuoteRow'
import ConstituentsTable from '../components/ConstituentsTable'
import FredRow from '../components/FredRow'
import { FRED, FRED_GROUPS } from '../data/fred'

export default function Indexes() {
  const { get } = useData()
  const [range, setRange] = useState('3M')
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const setQ = (v) => setParams(v ? { q: v } : {}, { replace: true })

  const custom = useMemo(() => {
    const list = CATEGORIES.map((c) => {
      const basket = c.basket.map((s) => ({ symbol: s, series: get(s) }))
      return { cat: c, basket, index: buildIndex(basket.map((b) => b.series)) }
    })
    const all = buildIndex(list.map((l) => l.index))
    return { list, all }
  }, [get])

  return (
    <div className="page">
      <h1>Indexes</h1>
      <p className="lede">
        Our own category indexes bundle public companies in each space into one number, like an S&amp;P 500 for that category.
        Each starts at 100 a year ago and is equal weighted. Tap any row to expand.
      </p>
      <SearchInput value={q} onChange={setQ} placeholder="Search indexes, tickers or companies" />
      <div className="seg sticky-seg">
        {RANGES.map((r) => (
          <button key={r.id} className={r.id === range ? 'on' : ''} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <h2>Category indexes</h2>
      <div className="rows">
        {matches(q, 'proc all combined index') && <QuoteRow
          label="PROC ALL"
          sub="All category baskets combined, equal weight"
          series={custom.all}
          unit="index, base 100"
          range={range}
        />}
        {custom.list.filter(({ cat }) => matches(q, cat.name, 'index', ...cat.basket)).map(({ cat, basket, index }) => (
          <QuoteRow
            key={cat.id}
            watchKey={`cat:${cat.id}`}
            label={cat.name.toUpperCase()}
            sub={`${cat.basket.length} companies: ${cat.basket.slice(0, 4).join(', ')}${cat.basket.length > 4 ? '...' : ''}`}
            series={index}
            unit="index, base 100"
            range={range}
            modalChildren={<ConstituentsTable items={basket} />}
          />
        ))}
      </div>

      {BENCHMARKS.map((g) => {
        const list = g.symbols.filter((s) => matches(q, s, SYMBOLS[s]?.name, g.title))
        if (!list.length) return null
        return (
        <section key={g.title}>
          <h2>{g.title}</h2>
          <div className="rows">
            {list.map((s) => (
              <QuoteRow
                key={s}
                watchKey={`sym:${s}`}
                label={s}
                sub={SYMBOLS[s]?.name}
                series={get(s)}
                unit={SYMBOLS[s]?.unit}
                range={range}
              />
            ))}
          </div>
        </section>
        )
      })}

      {FRED_GROUPS.map((g) => {
        const ids = g.ids.filter((id) => matches(q, FRED[id].title, id, g.title, FRED[id].src, 'fred'))
        if (!ids.length) return null
        return (
          <section key={g.title}>
            <h2>{g.title} (FRED)</h2>
            <div className="rows">
              {ids.map((id) => (
                <FredRow key={id} id={id} />
              ))}
            </div>
          </section>
        )
      })}
      <p className="muted dat-sub">
        FRED rows show the change from the previous reading and the year on year change. Source: Federal Reserve Bank of St. Louis, with BLS, EIA, BTS and IMF data.
      </p>
    </div>
  )
}
