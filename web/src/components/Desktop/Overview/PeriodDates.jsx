import { addDays } from '../../../utils/dateFormat'
import { TODAY } from '../../../hooks/useLeavePlanner'

// The holiday data runs to the end of 2028.
const LAST_DAY = '2028-12-31'
const input = 'h-9 border border-slate-300 rounded-lg px-1.5 text-[12.5px] font-bold bg-white'
const caption = 'text-[10px] font-extrabold text-slate-500 uppercase tracking-wide'

/**
 * The period's first and last day, shown for every period beside its name.
 * Changing either date makes the plan Custom with those dates.
 *
 * Props: period { from, to }, onChange({ from, to })
 */
export function PeriodDates({ period, onChange }) {
  return (
    <div role="group" aria-label="Your leave period" className="flex items-end gap-1.5">
      <label className="flex flex-col gap-0.5">
        <span className={caption}>First day</span>
        <input type="date" min={addDays(TODAY, 1)} max={period.to} value={period.from} onChange={e => e.target.value && onChange({ from: e.target.value, to: period.to })} className={input} />
      </label>
      <label className="flex flex-col gap-0.5">
        <span className={caption}>Last day</span>
        <input type="date" min={period.from} max={LAST_DAY} value={period.to} onChange={e => e.target.value && onChange({ from: period.from, to: e.target.value })} className={input} />
      </label>
    </div>
  )
}
