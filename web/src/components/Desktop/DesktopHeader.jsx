const PAGES = [
  { id: 'overview', label: 'Overview' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'holidays', label: 'Public holidays' },
]

export function DesktopHeader({ page, onPageChange }) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1320px] mx-auto px-8 h-[68px] flex items-center gap-8">
        <div className="text-xl font-extrabold tracking-tight">
          Stretch<span className="text-sky-700">My</span>Leave
        </div>
        <nav aria-label="Main" className="flex gap-1">
          {PAGES.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPageChange(p.id)}
              aria-current={page === p.id ? 'page' : undefined}
              className={[
                'px-3.5 py-2.5 rounded-lg text-[15px]',
                page === p.id ? 'bg-sky-100 text-sky-800 font-bold' : 'text-slate-700 font-semibold hover:bg-slate-100',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
