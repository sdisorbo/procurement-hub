import { NavLink } from 'react-router-dom'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  news: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  ),
  indexes: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <path d="M3.5 17l5-5.5 4 3.5 7.5-9" />
      <path d="M15 6h5v5" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 114 2c-.9.6-1.6 1.1-1.6 2.2M12 17h.01" />
    </svg>
  ),
}

const TABS = [
  ['/', 'News', 'news', true],
  ['/categories', 'Categories', 'categories', false],
  ['/indexes', 'Indexes', 'indexes', false],
  ['/quiz', 'Quiz', 'quiz', false],
]

// Phone only. The top nav links are hidden at that width.
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(([to, label, icon, end]) => (
        <NavLink key={to} to={to} end={end} className="bn-item">
          <span className="bn-ico">{ICONS[icon]}</span>
          <span className="bn-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
