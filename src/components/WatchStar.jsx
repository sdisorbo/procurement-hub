import { useWatchlist } from '../lib/Watchlist'

export default function WatchStar({ watchKey, className = '' }) {
  const { has, toggle } = useWatchlist()
  const on = has(watchKey)
  return (
    <button
      type="button"
      className={`star ${on ? 'on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={on ? 'Remove from watchlist' : 'Add to watchlist'}
      title={on ? 'Remove from watchlist' : 'Add to watchlist'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(watchKey)
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
