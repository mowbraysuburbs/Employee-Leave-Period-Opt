import { monthsBetween, monthPeriod } from '../../utils/dateFormat'
import { monthLabel } from '../../utils/planner'

const caption = 'text-[10px] font-extrabold text-slate-500 uppercase tracking-wide'

// One month dropdown ("Nov '26"); changed months tint blue.
function MonthSelect({ id, label, value, months, onChange, changed }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-0.5 min-w-0">
      <span className={caption}>{label}</span>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full h-9 border rounded-lg px-1.5 text-[13px] font-bold text-slate-900 ${changed ? 'border-sky-300 bg-sky-50' : 'border-slate-300 bg-white'}`}
      >
        {months.map(m => <option key={m} value={m}>{monthLabel(m, true)}</option>)}
      </select>
    </label>
  )
}

/**
 * The calendar's date period as whole months (From / To dropdowns, like the
 * Overview's Custom card), in the rail, its collapsed pop-out and the phone's
 * More filters. From starts on the 1st (this month: today); To ends on the
 * month's last day. Picking past the other end moves it along, so From ≤ To.
 *
 * Props:
 *   from, to, minDate, maxDate – YYYY-MM-DD
 *   onFromChange, onToChange   – (YYYY-MM-DD) => void
 *   changed, onReset           – tint + a Reset button once the period moves
 *   idPrefix                   – keeps ids unique per place
 */
export function PeriodPicker({ from, to, minDate, maxDate, onFromChange, onToChange, changed, onReset, idPrefix }) {
  const months = monthsBetween(minDate, maxDate)
  const fromMonth = from.slice(0, 7)
  const toMonth = to.slice(0, 7)
  function pick(nextFrom, nextTo) {
    const next = monthPeriod(nextFrom, nextTo, { min: minDate, max: maxDate })
    if (next.from !== from) onFromChange(next.from)
    if (next.to !== to) onToChange(next.to)
  }
  return (
    <div role="group" aria-label="Date period (months)" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold">Dates</span>
        {changed && <button type="button" onClick={onReset} className="text-xs font-bold text-sky-700">Reset</button>}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <MonthSelect id={`${idPrefix}-from`} label="From" value={fromMonth} months={months} changed={changed} onChange={m => pick(m, toMonth < m ? m : toMonth)} />
        <MonthSelect id={`${idPrefix}-to`} label="To" value={toMonth} months={months} changed={changed} onChange={m => pick(fromMonth > m ? m : fromMonth, m)} />
      </div>
    </div>
  )
}
