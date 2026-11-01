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
 *   previewCount, previewOnly, onPreviewOnlyChange
 *                                  – "Only selected dates" filter while an Overview plan is open
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
  previewCount,
  previewOnly,
  onPreviewOnlyChange,
}) {
  const toggleClass = on => [
    'h-11 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-semibold border',
    on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300 shadow-sm',
  ].join(' ')

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

      {previewCount > 0 && (
        <button type="button" aria-pressed={previewOnly} onClick={() => onPreviewOnlyChange(!previewOnly)} className={toggleClass(previewOnly)}>
          Only selected dates ({previewCount})
        </button>
      )}

      <button type="button" aria-pressed={picksOnly} onClick={() => onPicksOnlyChange(!picksOnly)} className={toggleClass(picksOnly)}>
        Only my breaks ({savedCount})
      </button>

      <HoverKey colourBy={colourBy} />
    </section>
  )
}
