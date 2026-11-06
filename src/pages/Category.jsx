import { Link, useParams } from 'react-router-dom'
import { categoryById } from '../data/categories'
import { SYMBOLS } from '../data/symbols'
import { useCategoryData } from '../lib/useCategory'
import QuoteRow from '../components/QuoteRow'
import ConditionTag from '../components/ConditionTag'
import SupplierMap from '../components/SupplierMap'
import NewsList from '../components/NewsList'
import ConstituentsTable from '../components/ConstituentsTable'

export default function Category() {
  const { id } = useParams()
  const cat = categoryById(id)
  if (!cat) {
    return (
      <div className="page">
        <p>Category not found.</p>
        <Link to="/categories">Back to categories</Link>
      </div>
    )
  }
  return <CategoryView cat={cat} />
}

function CategoryView({ cat }) {
  const { commodities, basket, index, condition } = useCategoryData(cat)
  return (
    <div className="page">
      <Link to="/categories" className="back">All categories</Link>
      <div className="cat-title">
        <h1>{cat.name}</h1>
        {condition && <ConditionTag tag={condition.tag} level={condition.level} />}
      </div>
      {condition && <p className="summary">{condition.summary}</p>}
      <ul className="watch">
        {cat.watch.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>

      <h2>Prices</h2>
      <div className="rows">
        <QuoteRow
          label={`${cat.name} supplier index`}
          sub={`Synthetic, equal weight, ${cat.basket.length} public companies`}
          series={index}
          unit="index, base 100"
          modalChildren={<ConstituentsTable items={basket} />}
        />
        {commodities.map((c) => (
          <QuoteRow
            key={c.symbol}
            label={c.symbol}
            sub={SYMBOLS[c.symbol]?.name}
            series={c.series}
            unit={SYMBOLS[c.symbol]?.unit}
          />
        ))}
      </div>

      <h2>Top suppliers</h2>
      <SupplierMap suppliers={cat.suppliers} />
      <div className="table-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>HQ</th>
              <th>Ticker</th>
              <th>What they supply</th>
            </tr>
          </thead>
          <tbody>
            {cat.suppliers.map((s) => (
              <tr key={s[0]}>
                <td className="strong">{s[0]}</td>
                <td>
                  {s[1]}, {s[2]}
                </td>
                <td>{s[5] || 'Private'}</td>
                <td>{s[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{cat.name} news</h2>
      <NewsList query={cat.newsQuery} limit={12} />
    </div>
  )
}
