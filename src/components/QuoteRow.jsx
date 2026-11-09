import { useState } from 'react'
import Sparkline from './Sparkline'
import ChartModal from './ChartModal'
import { sliceRange, periodChange, last, fmtPrice, fmtPct } from '../lib/series'

// Row styled like a watchlist line: label left, sparkline middle, value and change right.
export default function QuoteRow({ label, sub, series, unit, range = '3M', modalChildren, modalSubtitle, compare }) {
  const [open, setOpen] = useState(false)
  if (!series) {
    return (
      <div className="quote-row missing">
        <div className="q-left">
          <div className="q-sym">{label}</div>
          <div className="q-sub">{sub}</div>
        </div>
        <span />
        <div className="q-right muted">No data</div>
      </div>
    )
  }
  const s = sliceRange(series, range)
  // compare 'prev' shows the change from the previous point, which suits monthly series.
  const change = compare === 'prev' && s.v.length > 1 ? (s.v[s.v.length - 1] / s.v[s.v.length - 2] - 1) * 100 : periodChange(s)
  const up = change >= 0
  return (
    <>
      <button className="quote-row" onClick={() => setOpen(true)}>
        <div className="q-left">
          <div className="q-sym">{label}</div>
          <div className="q-sub">{sub}</div>
        </div>
        <Sparkline values={s.v} up={up} />
        <div className="q-right">
          <div className="q-price">{fmtPrice(last(s))}</div>
          <div className={`pill ${up ? 'pos' : 'neg'}`}>{fmtPct(change)}</div>
        </div>
      </button>
      {open && (
        <ChartModal
          title={label}
          subtitle={modalSubtitle || sub}
          series={series}
          unit={unit}
          onClose={() => setOpen(false)}
          initialRange={range === '1M' ? '3M' : range}
        >
          {modalChildren}
        </ChartModal>
      )}
    </>
  )
}
