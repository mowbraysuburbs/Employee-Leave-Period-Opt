const TABS = [
  { id: 'overview', label: 'Overview', icon: 'M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z' },
  { id: 'calendar', label: 'Calendar', icon: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4' },
  { id: 'holidays', label: 'Holidays', icon: 'M5 21V4M5 4h11l-2 4 2 4H5' },
  { id: 'events', label: 'Events', icon: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z' },
]

// Bottom navigation for the phone layout.
export function MobileTabBar({ page, onPageChange }) {
  return (
    <nav aria-label="Pages" className="shrink-0 h-16 pb-1.5 bg-white border-t border-slate-200 grid grid-cols-4">
      {TABS.map(t => {
        const on = page === t.id
        return (
          <button
            key={t.id}
            type="button"
            aria-current={on ? 'page' : undefined}
            onClick={() => onPageChange(t.id)}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${on ? 'text-sky-700' : 'text-slate-500'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
