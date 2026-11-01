const PAGES = [
  { id: 'overview', label: 'Overview' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'holidays', label: 'Public holidays' },
  { id: 'events', label: 'Events', soon: true },
]

// rightSlot: optional controls for the header's right-hand end (the calendar's Key).
export function DesktopHeader({ page, onPageChange, rightSlot }) {
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
              {p.soon && <span className="ml-1.5 px-1.5 py-px rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold align-middle">Soon</span>}
            </button>
          ))}
        </nav>
        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>
    </header>
  )
}
