import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../components/SearchInput'
import { matches } from '../lib/searchIndex'
import { CATEGORIES } from '../data/categories'
import { useCategoryData } from '../lib/useCategory'
import { sliceRange, periodChange, fmtPct } from '../lib/series'
import Sparkline from '../components/Sparkline'
import ConditionTag from '../components/ConditionTag'

function Card({ cat }) {
  const { index, condition } = useCategoryData(cat)
  const s = index ? sliceRange(index, '3M') : { v: [] }
  const ch = index ? periodChange(s) : 0
  return (
    <Link to={`/categories/${cat.id}`} className="cat-card">
      <div className="cat-top">
        <h3>{cat.name}</h3>
        {condition && <ConditionTag tag={condition.tag} level={condition.level} />}
      </div>
      <p className="muted">{cat.blurb}</p>
      <div className="cat-bottom">
        {index ? (
          <>
            <Sparkline values={s.v} up={ch >= 0} width={150} height={40} />
            <div className="cat-idx">
              <span className={ch >= 0 ? 'posText' : 'negText'}>{fmtPct(ch, 1)}</span>
              <small className="muted">3M supplier index</small>
            </div>
          </>
        ) : (
          <span className="muted">No price data</span>
        )}
      </div>
    </Link>
  )
}

export default function Categories() {
  const [q, setQ] = useState('')
  const shown = CATEGORIES.filter((c) => matches(q, c.name, c.blurb, ...c.basket, ...c.suppliers.map((s) => s[0])))
  return (
    <div className="page">
      <h1>Categories</h1>
      <p className="lede">Pick a category for its market read, price drivers, supplier map and news.</p>
      <SearchInput value={q} onChange={setQ} placeholder="Search categories, companies or tickers" />
      <div className="cat-grid">
        {shown.map((c) => (
          <Card key={c.id} cat={c} />
        ))}
      </div>
      {!shown.length && <p className="note">No category matches "{q}".</p>}
    </div>
  )
}
