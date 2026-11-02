const dateInput = 'h-8 border border-slate-200 rounded-lg px-2 text-sm font-medium text-slate-900'

function DateInput({ id, min, max, value, onChange, className = '' }) {
  return (
    <input
      id={id}
      type="date"
      min={min}
      max={max}
      value={value}
      onChange={e => e.target.value && onChange(e.target.value)}
      className={`${dateInput} ${className}`}
    />
  )
}

/**
 * From / to date inputs, shared by the Overview header and the calendar controls.
 *
 * Props:
 *   from, to, minDate, maxDate – YYYY-MM-DD
 *   onFromChange, onToChange   – (YYYY-MM-DD) => void
 *   changed, onReset           – shows a Reset button once the period moves
 *   idPrefix                   – keeps label/input ids unique per page
 *   stacked                    – narrow layout for the rail and phone Filters: a
 *                                "Dates" heading with Reset beside it, then Start
 *                                and End labels on the left with the boxes aligned
 */
export function PeriodPicker({ from, to, minDate, maxDate, onFromChange, onToChange, changed, onReset, idPrefix, stacked = false }) {
  if (stacked) {
    // Changed dates tint blue, so it's clear the period isn't the default.
    const tint = changed ? 'w-full border-sky-300 bg-sky-50' : 'w-full'
    return (
      <div role="group" aria-label="Date period" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-bold">Dates</span>
          {changed && (
            <button type="button" onClick={onReset} className="text-xs font-bold text-sky-700">Reset</button>
          )}
        </div>
        <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-x-2 gap-y-1.5 items-center text-[13px]">
          <label htmlFor={`${idPrefix}-from`} className="font-semibold text-slate-700">Start</label>
          <DateInput id={`${idPrefix}-from`} min={minDate} max={to} value={from} onChange={onFromChange} className={tint} />
          <label htmlFor={`${idPrefix}-to`} className="font-semibold text-slate-700">End</label>
          <DateInput id={`${idPrefix}-to`} min={from} max={maxDate} value={to} onChange={onToChange} className={tint} />
        </div>
      </div>
    )
  }

  return (
    <div role="group" aria-label="Date period" className="min-h-11 flex flex-wrap items-center gap-2 pl-3.5 pr-1.5 py-1 rounded-xl bg-white border border-slate-300 shadow-sm text-sm">
      <label htmlFor={`${idPrefix}-from`} className="font-semibold">From</label>
      <DateInput id={`${idPrefix}-from`} min={minDate} max={to} value={from} onChange={onFromChange} />
      <label htmlFor={`${idPrefix}-to`} className="font-semibold">to</label>
      <DateInput id={`${idPrefix}-to`} min={from} max={maxDate} value={to} onChange={onToChange} />
      {changed && (
        <button type="button" onClick={onReset} className="h-8 px-2.5 rounded-lg bg-slate-100 text-sky-700 text-[13px] font-bold">
          Reset
        </button>
      )}
    </div>
  )
}
