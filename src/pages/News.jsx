import { useState } from 'react'
import NewsList from '../components/NewsList'
import Watchlist from '../components/Watchlist'
import MoverGrid from '../components/MoverGrid'

const TOPICS = [
  { id: 'all', label: 'All', q: 'procurement OR strategic sourcing OR "supply chain" purchasing', partners: 'merge' },
  { id: 'sourcing', label: 'Sourcing and suppliers', q: 'strategic sourcing OR supplier negotiations OR supplier risk', partners: 'merge' },
  { id: 'trade', label: 'Tariffs and trade', q: 'tariffs imports trade policy supply chain' },
  { id: 'logistics', label: 'Logistics', q: 'freight rates OR port congestion OR logistics costs' },
  { id: 'commodities', label: 'Commodities', q: 'commodity prices raw materials costs' },
  { id: 'risk', label: 'Supply chain risk', q: 'supply chain disruption shortage' },
  { id: 'insights', label: 'Inverto and GEP', q: 'procurement', partners: 'only' },
]

export default function News() {
  const [topic, setTopic] = useState('all')
  const t = TOPICS.find((x) => x.id === topic)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div className="page news-page">
      <div className="masthead">
        <h1>News</h1>
        <span className="masthead-date">{today}</span>
      </div>
      <div className="news-grid">
        <section className="news-left">
          <h2 className="sec-h">Biggest movers today</h2>
          <MoverGrid />
          <Watchlist />
        </section>
        <section className="news-right">
          <h2 className="sec-h">Headlines</h2>
          <div className="chips">
            {TOPICS.map((x) => (
              <button key={x.id} className={x.id === topic ? 'on' : ''} onClick={() => setTopic(x.id)}>
                {x.label}
              </button>
            ))}
          </div>
          <NewsList key={topic} query={t.q} limit={20} partners={t.partners} lead />
        </section>
      </div>
    </div>
  )
}
