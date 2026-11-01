import { HolidayFilterMenu } from './HolidayFilterMenu'
import { HoverKey } from './HoverKey'
import { PeriodPicker } from './PeriodPicker'

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
      <PeriodPicker
        idPrefix="calendar-period"
        from={from}
        to={to}
        minDate={minDate}
        maxDate={maxDate}
        onFromChange={onFromChange}
        onToChange={onToChange}
        changed={rangeChanged}
        onReset={onResetRange}
      />

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
