import QuoteRow from './QuoteRow'
import { useData } from '../lib/DataContext'
import { FRED } from '../data/fred'
import { changeOver, fmtPct } from '../lib/series'

const PERIOD = { monthly: 'month', weekly: 'week', daily: 'day' }

// One FRED series as a row. The pill shows the change from the previous reading, the subtitle shows the year on year change.
export default function FredRow({ id }) {
  const { get } = useData()
  const meta = FRED[id]
  if (!meta) return null
  const series = get(`FRED:${id}`)
  const yoy = series ? changeOver(series, 365) : null
  const sub = [yoy != null ? `YoY ${fmtPct(yoy, 1)}` : null, meta.src].filter(Boolean).join(' · ')
  const lastDate = series ? series.d[series.d.length - 1] : ''
  return (
    <QuoteRow
      watchKey={`fred:${id}`}
      label={meta.title}
      sub={sub}
      modalSubtitle={`${meta.unit}. ${meta.src}, updated ${meta.freq}. Latest reading ${lastDate}. Change shown on the row is versus the prior ${PERIOD[meta.freq]}.`}
      series={series}
      unit={meta.unit}
      range={meta.freq === 'monthly' ? '3Y' : '1Y'}
      compare="prev"
    />
  )
}

export function FredSection({ ids }) {
  return (
    <div>
      <div className="rows">
        {ids.map((id) => (
          <FredRow key={id} id={id} />
        ))}
      </div>
      <p className="muted dat-sub">
        Data from <a href="https://fred.stlouisfed.org" target="_blank" rel="noreferrer">FRED</a>, Federal Reserve Bank of St. Louis. Retail prices are BLS averages, producer prices are BLS indexes, and "Global" series are from the International Monetary Fund. Government data runs weeks behind.
      </p>
    </div>
  )
}
