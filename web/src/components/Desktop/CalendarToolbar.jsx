import { HolidayFilterMenu } from './HolidayFilterMenu'
import { HoverKey } from './HoverKey'

const dateInput = 'h-8 border border-slate-200 rounded-lg px-2 text-sm font-medium text-slate-900'

/**
 * Props:
 *   from, to, minDate, maxDate    – YYYY-MM-DD
 *   onFromChange, onToChange       – (YYYY-MM-DD) => void
 *   rangeChanged, onResetRange     – shows a Reset button once the period moves
 *   holidayOptions, holidayFilter, onHolidayFilterChange
 *   picksOnly, onPicksOnlyChange, savedCount
 *   colourBy                       – orders the hover-card key to match the card
 */
export function CalendarToolbar({
  from,
  to,
  minDate,
  maxDate,
  onFromChange,
  onToChange,
  rangeChanged,
  onResetRange,
  holidayOptions,
  holidayFilter,
  onHolidayFilterChange,
  picksOnly,
  onPicksOnlyChange,
  savedCount,
  colourBy,
}) {
  return (
    <section className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Date period" className="h-11 inline-flex items-center gap-2 pl-3.5 pr-1.5 rounded-xl bg-white border border-slate-300 shadow-sm text-sm">
        <label htmlFor="period-from" className="font-semibold">From</label>
        <input
          id="period-from"
          type="date"
          min={minDate}
          max={to}
          value={from}
          onChange={e => e.target.value && onFromChange(e.target.value)}
          className={dateInput}
        />
        <label htmlFor="period-to" className="font-semibold">to</label>
        <input
          id="period-to"
          type="date"
          min={from}
          max={maxDate}
          value={to}
          onChange={e => e.target.value && onToChange(e.target.value)}
          className={dateInput}
        />
        {rangeChanged && (
          <button type="button" onClick={onResetRange} className="h-8 px-2.5 rounded-lg bg-slate-100 text-sky-700 text-[13px] font-bold">
            Reset
          </button>
        )}
      </div>

      <HolidayFilterMenu options={holidayOptions} selected={holidayFilter} onChange={onHolidayFilterChange} />

      <button
        type="button"
        aria-pressed={picksOnly}
        onClick={() => onPicksOnlyChange(!picksOnly)}
        className={[
          'h-11 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-semibold border',
          picksOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300 shadow-sm',
        ].join(' ')}
      >
        Only my breaks ({savedCount})
      </button>

      <HoverKey colourBy={colourBy} />
    </section>
  )
}
