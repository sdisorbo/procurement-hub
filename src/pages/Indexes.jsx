import { useMemo, useState } from 'react'
import { CATEGORIES, BENCHMARKS } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useData } from '../lib/DataContext'
import { buildIndex, RANGES } from '../lib/series'
import QuoteRow from '../components/QuoteRow'
import ConstituentsTable from '../components/ConstituentsTable'

export default function Indexes() {
  const { get } = useData()
  const [range, setRange] = useState('3M')

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
      <div className="seg sticky-seg">
        {RANGES.map((r) => (
          <button key={r.id} className={r.id === range ? 'on' : ''} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <h2>Category indexes</h2>
      <div className="rows">
        <QuoteRow
          label="PROC ALL"
          sub="All category baskets combined, equal weight"
          series={custom.all}
          unit="index, base 100"
          range={range}
        />
        {custom.list.map(({ cat, basket, index }) => (
          <QuoteRow
            key={cat.id}
            label={cat.name.toUpperCase()}
            sub={`${cat.basket.length} companies: ${cat.basket.slice(0, 4).join(', ')}${cat.basket.length > 4 ? '...' : ''}`}
            series={index}
            unit="index, base 100"
            range={range}
            modalChildren={<ConstituentsTable items={basket} />}
          />
        ))}
      </div>

      {BENCHMARKS.map((g) => (
        <section key={g.title}>
          <h2>{g.title}</h2>
          <div className="rows">
            {g.symbols.map((s) => (
              <QuoteRow
                key={s}
                label={s}
                sub={SYMBOLS[s]?.name}
                series={get(s)}
                unit={SYMBOLS[s]?.unit}
                range={range}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
