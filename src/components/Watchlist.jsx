import { Link } from 'react-router-dom'
import { CATEGORIES, categoryById } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useData } from '../lib/DataContext'
import { useWatchlist } from '../lib/Watchlist'
import { computeCategory } from '../lib/useCategory'
import QuoteRow from './QuoteRow'
import ConstituentsTable from './ConstituentsTable'

export default function Watchlist() {
  const { list } = useWatchlist()
  const { get } = useData()

  const rows = list
    .map((key) => {
      if (key.startsWith('cat:')) {
        const cat = categoryById(key.slice(4))
        if (!cat) return null
        const { index, basket, condition } = computeCategory(cat, get)
        return (
          <QuoteRow
            key={key}
            watchKey={key}
            label={cat.name}
            sub={condition ? condition.tag : 'Supplier index'}
            series={index}
            unit="index, base 100"
            compare="prev"
            modalChildren={
              <>
                <p>
                  <Link to={`/categories/${cat.id}`} className="inline-link">
                    Open the {cat.name} page
                  </Link>
                </p>
                <ConstituentsTable items={basket} />
              </>
            }
          />
        )
      }
      if (key.startsWith('sym:')) {
        const sym = key.slice(4)
        return (
          <QuoteRow
            key={key}
            watchKey={key}
            label={SYMBOLS[sym]?.name || sym}
            sub={sym}
            series={get(sym)}
            unit={SYMBOLS[sym]?.unit}
            compare="prev"
          />
        )
      }
      return null
    })
    .filter(Boolean)

  return (
    <section className="watch-sec">
      <div className="watch-head">
        <h2>Watchlist</h2>
        <span className="muted">Change shown is 1 day</span>
      </div>
      {rows.length ? (
        <div className="rows">{rows}</div>
      ) : (
        <p className="note">
          Nothing pinned yet. Tap the star on a <Link to="/categories">category</Link> or on a row in <Link to="/indexes">Indexes</Link> to pin it here.
        </p>
      )}
    </section>
  )
}
