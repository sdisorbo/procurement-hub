import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useData } from './lib/DataContext'
import News from './pages/News'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Indexes from './pages/Indexes'
import Quiz from './pages/Quiz'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function DataBanner() {
  const { status, liveCount } = useData()
  if (status === 'loading' || status === 'live') return null
  return (
    <div className="banner">
      {status === 'sample'
        ? 'Showing sample prices. The live price feed did not respond, so charts and tags are illustrative.'
        : `Live prices loaded for ${liveCount} symbols. The rest show sample data.`}
    </div>
  )
}

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <NavLink to="/" className="brand">
            <span className="brand-mark" />
            <span className="brand-text">
            Procurement Hub</span>
          </NavLink>
          <nav>
            <NavLink to="/" end>News</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/indexes">Indexes</NavLink>
            <NavLink to="/quiz">Quiz</NavLink>
          </nav>
        </div>
      </header>
      <DataBanner />
      <main className="wrap">
        <ScrollTop />
        <Routes>
          <Route path="/" element={<News />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<Category />} />
          <Route path="/indexes" element={<Indexes />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="*" element={<News />} />
        </Routes>
      </main>
      <footer className="wrap foot">Headlines come from Google News. Prices come from Yahoo Finance and can be delayed. Not investment advice.</footer>
    </>
  )
}
