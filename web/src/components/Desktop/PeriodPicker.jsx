const dateInput = 'h-8 border border-slate-200 rounded-lg px-2 text-sm font-medium text-slate-900'

/**
 * From / to date inputs, shared by the Overview header and the calendar toolbar.
 *
 * Props:
 *   from, to, minDate, maxDate – YYYY-MM-DD
 *   onFromChange, onToChange   – (YYYY-MM-DD) => void
 *   changed, onReset           – shows a Reset button once the period moves
 *   idPrefix                   – keeps label/input ids unique per page
 */
export function PeriodPicker({ from, to, minDate, maxDate, onFromChange, onToChange, changed, onReset, idPrefix }) {
  return (
    <div role="group" aria-label="Date period" className="min-h-11 flex flex-wrap items-center gap-2 pl-3.5 pr-1.5 py-1 rounded-xl bg-white border border-slate-300 shadow-sm text-sm">
      <label htmlFor={`${idPrefix}-from`} className="font-semibold">From</label>
      <input
        id={`${idPrefix}-from`}
        type="date"
        min={minDate}
        max={to}
        value={from}
        onChange={e => e.target.value && onFromChange(e.target.value)}
        className={dateInput}
      />
      <label htmlFor={`${idPrefix}-to`} className="font-semibold">to</label>
      <input
        id={`${idPrefix}-to`}
        type="date"
        min={from}
        max={maxDate}
        value={to}
        onChange={e => e.target.value && onToChange(e.target.value)}
        className={dateInput}
      />
      {changed && (
        <button type="button" onClick={onReset} className="h-8 px-2.5 rounded-lg bg-slate-100 text-sky-700 text-[13px] font-bold">
          Reset
        </button>
      )}
    </div>
  )
}
