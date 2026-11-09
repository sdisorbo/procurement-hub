import QuoteRow from './QuoteRow'
import { useData } from '../lib/DataContext'

const EQ = [
  ['van', 'Dry van'],
  ['reefer', 'Reefer'],
  ['flatbed', 'Flatbed'],
]

const monthName = (m) => new Date(m + '-15T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const money = (n) => `$${n.toFixed(2)}`
const delta = (a, b) => (b == null ? '' : `${a - b >= 0 ? '+' : '-'}${Math.abs(a - b).toFixed(2)}`)

export default function DatPanel() {
  const { dat, get } = useData()
  if (!dat.length) return <p className="note">DAT truckload rates did not load.</p>
  const last = dat[dat.length - 1]
  const prev = dat[dat.length - 2]
  return (
    <div>
      <p className="muted dat-sub">
        National average for {monthName(last.month)}, dollars per mile including fuel. Source:{' '}
        <a href={last.url} target="_blank" rel="noreferrer">
          DAT news release
        </a>
        . Spot is what brokers pay carriers per load. Contract is the negotiated rate shippers pay.
      </p>
      <div className="table-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>Equipment</th>
              <th className="num">Spot</th>
              <th className="num">vs prior</th>
              <th className="num">Contract</th>
              <th className="num">vs prior</th>
              <th className="num">Spot minus contract</th>
            </tr>
          </thead>
          <tbody>
            {EQ.map(([k, label]) => (
              <tr key={k}>
                <td className="strong">{label}</td>
                <td className="num">{money(last.spot[k])}</td>
                <td className="num">{delta(last.spot[k], prev?.spot[k])}</td>
                <td className="num">{money(last.contract[k])}</td>
                <td className="num">{delta(last.contract[k], prev?.contract[k])}</td>
                <td className="num">{delta(last.spot[k], last.contract[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rows dat-rows">
        {EQ.flatMap(([k, label]) =>
          ['spot', 'contract'].map((kind) => (
            <QuoteRow
              key={k + kind}
              label={`${label} ${kind}`}
              sub="DAT national average, monthly, change vs prior month"
              series={get(`DAT:${kind}:${k}`)}
              unit="$ per mile"
              range="1Y"
              compare="prev"
            />
          )),
        )}
      </div>
      <p className="muted dat-sub">Months where DAT only published rates without fuel are left out, so a series can skip a month.</p>
    </div>
  )
}
