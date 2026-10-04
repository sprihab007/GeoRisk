import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Explore' },
  { to: '/events', label: 'Live Events' },
  { to: '/compare', label: 'Compare' },
  { to: '/sources', label: 'Sources' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-base-700 bg-base-900/95 backdrop-blur z-[1100] relative">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-accent-500/15 border border-accent-500/40 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-400" />
        </div>
        <span className="font-semibold tracking-tight text-slate-100">GeoRisk</span>
        <span className="hidden sm:inline text-[11px] text-slate-500 ml-1 pt-0.5">Global Risk Explorer</span>
      </div>
      <nav className="flex items-center gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-accent-400 bg-accent-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-base-800'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
