// Segmented pill above the calendar: the days-off heatmap ("Best days") or
// the user's own ticked periods coloured by day type ("My leave").
export function CalendarViewToggle({ view, onChange, selectedCount }) {
  const btn = (active) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
      active
        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
    }`

  return (
    <div
      role="group"
      aria-label="Calendar view"
      className="inline-flex p-[3px] rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
    >
      <button type="button" aria-pressed={view === 'heatmap'} onClick={() => onChange('heatmap')} className={btn(view === 'heatmap')}>
        Best days
      </button>
      <button type="button" aria-pressed={view === 'plan'} onClick={() => onChange('plan')} className={btn(view === 'plan')}>
        My leave
        {selectedCount > 0 && (
          <span className="min-w-4 h-4 px-1 rounded-full bg-sky-500 text-white text-[10px] leading-4 text-center tabular-nums">
            {selectedCount}
          </span>
        )}
      </button>
    </div>
  )
}
