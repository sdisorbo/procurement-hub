import { SYMBOLS } from '../data/symbols'
import { pctChange, last, fmtPrice, fmtPct } from '../lib/series'

export default function ConstituentsTable({ items }) {
  return (
    <div className="table-scroll">
      <table className="tbl">
        <thead>
          <tr>
            <th>Company</th>
            <th className="num">Last</th>
            <th className="num">1M</th>
            <th className="num">3M</th>
            <th className="num">12M</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ symbol, series }) => {
            const cells = [21, 63, 252].map((n) => pctChange(series, n))
            return (
              <tr key={symbol}>
                <td>
                  <span className="strong">{symbol}</span> <span className="muted">{SYMBOLS[symbol]?.name}</span>
                </td>
                <td className="num">{fmtPrice(last(series))}</td>
                {cells.map((c, i) => (
                  <td key={i} className={`num ${c >= 0 ? 'posText' : 'negText'}`}>
                    {fmtPct(c, 1)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
