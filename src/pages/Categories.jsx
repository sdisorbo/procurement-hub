import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useCategoryData } from '../lib/useCategory'
import { sliceRange, periodChange, fmtPct } from '../lib/series'
import Sparkline from '../components/Sparkline'
import ConditionTag from '../components/ConditionTag'

function Card({ cat }) {
  const { index, condition } = useCategoryData(cat)
  const s = sliceRange(index, '3M')
  const ch = periodChange(s)
  return (
    <Link to={`/categories/${cat.id}`} className="cat-card">
      <div className="cat-top">
        <h3>{cat.name}</h3>
        {condition && <ConditionTag tag={condition.tag} level={condition.level} />}
      </div>
      <p className="muted">{cat.blurb}</p>
      <div className="cat-bottom">
        <Sparkline values={s.v} up={ch >= 0} width={150} height={40} />
        <div className="cat-idx">
          <span className={ch >= 0 ? 'posText' : 'negText'}>{fmtPct(ch, 1)}</span>
          <small className="muted">3M supplier index</small>
        </div>
      </div>
    </Link>
  )
}

export default function Categories() {
  return (
    <div className="page">
      <h1>Categories</h1>
      <p className="lede">Pick a category for its market read, price drivers, supplier map and news.</p>
      <div className="cat-grid">
        {CATEGORIES.map((c) => (
          <Card key={c.id} cat={c} />
        ))}
      </div>
    </div>
  )
}
