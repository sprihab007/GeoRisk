import { useEffect, useState, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { searchLocation } from '../services/geocodingApi'

export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debouncedQuery = useDebounce(query, 400)
  const containerRef = useRef(null)

  // Only fires once the user pauses typing for 400ms (see useDebounce),
  // so we don't send a geocoding request on every keystroke.
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    searchLocation(debouncedQuery)
      .then((r) => { if (!cancelled) { setResults(r); setOpen(true) } })
      .catch(() => { if (!cancelled) setError('Location search unavailable right now.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(result) {
    onSelectLocation({ lat: result.lat, lon: result.lon, label: result.label })
    setQuery(result.label)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 glass-panel rounded-xl px-3.5 py-2.5 shadow-panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a city or location..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
        />
        {loading && <span className="text-xs text-slate-500 shrink-0">…</span>}
      </div>

      {open && (results.length > 0 || error) && (
        <div className="absolute mt-1.5 w-full glass-panel rounded-xl shadow-panel overflow-hidden z-[1000]">
          {error && <div className="px-3.5 py-2.5 text-xs text-red-400">{error}</div>}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-base-700/60 transition-colors border-b border-base-700/50 last:border-0"
            >
              <div className="text-slate-100">{r.name}</div>
              <div className="text-xs text-slate-500">{[r.admin1, r.country].filter(Boolean).join(', ')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
