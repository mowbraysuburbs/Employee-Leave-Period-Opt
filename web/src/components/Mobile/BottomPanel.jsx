/**
 * The phone calendar's controls, kept at the bottom within thumb reach:
 * days-off chips (tap to filter), leave days, Filters and My breaks.
 *
 * Props:
 *   legend, filterable, daysOffFilter, onToggleDaysOff, onClearDaysOff
 *   leaveDays, maxLeave, onLeaveDaysChange
 *   savedCount, savedDaysOff
 *   onOpenFilters, onOpenSummary
 */
export function BottomPanel({
  legend,
  filterable,
  daysOffFilter,
  onToggleDaysOff,
  onClearDaysOff,
  leaveDays,
  maxLeave,
  onLeaveDaysChange,
  savedCount,
  savedDaysOff,
  onOpenFilters,
  onOpenSummary,
}) {
  const filtering = filterable && daysOffFilter.length > 0
  const chip = 'shrink-0 min-w-[28px] h-7 px-1.5 rounded-full inline-flex items-center justify-center text-xs font-bold text-slate-900'

  return (
    <div className="shrink-0 px-3.5 pt-2.5 pb-2.5 bg-white border-t border-slate-200 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] flex flex-col gap-2.5 [&>*]:w-full [&>*]:max-w-[520px] [&>*]:mx-auto">
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        <span className="shrink-0 mr-0.5 text-[11px] font-semibold text-slate-500">Days off</span>
        {legend.map(l => {
          if (!filterable) return <span key={l.label} className={chip} style={{ backgroundColor: l.colour }}>{l.label}</span>
          const on = daysOffFilter.includes(l.value)
          return (
            <button
              key={l.label}
              type="button"
              aria-pressed={on}
              aria-label={`${on ? 'Hide' : 'Show only'} days with ${l.label} days off`}
              onClick={() => onToggleDaysOff(l.value)}
              className={`${chip} ${on ? 'ring-2 ring-slate-900 ring-offset-1' : filtering ? 'opacity-30' : ''}`}
              style={{ backgroundColor: l.colour }}
            >
              {l.label}
            </button>
          )
        })}
        {filtering && (
          <button type="button" onClick={onClearDaysOff} className="shrink-0 h-7 px-2 rounded-full bg-slate-100 text-sky-700 text-xs font-bold">
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 h-[46px] pl-3 pr-1.5 rounded-full bg-slate-100 flex items-center justify-between">
          <span className="text-[13px] font-bold">Leave</span>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Fewer leave days" disabled={leaveDays <= 1} onClick={() => onLeaveDaysChange(leaveDays - 1)} className="w-[34px] h-[34px] rounded-full bg-white shadow-sm text-lg font-semibold disabled:opacity-40">−</button>
            <span aria-live="polite" className="w-7 text-center text-[22px] font-extrabold">{leaveDays}</span>
            <button type="button" aria-label="More leave days" disabled={leaveDays >= maxLeave} onClick={() => onLeaveDaysChange(leaveDays + 1)} className="w-[34px] h-[34px] rounded-full bg-sky-700 text-white text-lg font-semibold disabled:opacity-40">+</button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Filters"
          onClick={onOpenFilters}
          className="shrink-0 w-[46px] h-[46px] rounded-full border border-slate-300 bg-white flex items-center justify-center"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onOpenSummary}
          className="shrink-0 h-[46px] px-3 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center leading-tight"
        >
          <span className="text-[13px] font-bold">My breaks</span>
          <span className="text-[11px] font-semibold opacity-75">{savedCount} · {savedDaysOff} days off</span>
        </button>
      </div>
    </div>
  )
}
