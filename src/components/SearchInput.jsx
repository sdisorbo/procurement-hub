export default function SearchInput({ value, onChange, placeholder, onKeyDown, autoFocus }) {
  return (
    <div className="search">
      <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M13 13l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
    </div>
  )
}
