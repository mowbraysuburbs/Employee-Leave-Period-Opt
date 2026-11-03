import { addDays } from '../../../utils/dateFormat'
import { TODAY } from '../../../hooks/useLeavePlanner'

// The holiday data runs to the end of 2028.
const LAST_DAY = '2028-12-31'
const caption = 'text-[10px] font-extrabold text-slate-500 uppercase tracking-wide'

/**
 * Start and End of the period being planned, in the Custom dates card. They
 * show whichever period is picked; changing one makes the plan Custom.
 *
 * Props: period { from, to }, onChange({ from, to }), active – Custom is picked
 */
export function PeriodDates({ period, onChange, active }) {
  const input = `w-full h-9 border rounded-lg px-1.5 text-[12px] font-bold bg-white ${active ? 'border-sky-700 text-slate-900' : 'border-slate-300 text-slate-500'}`
  return (
    <div role="group" aria-label="Your leave period" className="grid grid-cols-2 gap-1.5">
      <label className="flex flex-col gap-0.5 min-w-0">
        <span className={caption}>Start</span>
        <input type="date" min={addDays(TODAY, 1)} max={period.to} value={period.from} onChange={e => e.target.value && onChange({ from: e.target.value, to: period.to })} className={input} />
      </label>
      <label className="flex flex-col gap-0.5 min-w-0">
        <span className={caption}>End</span>
        <input type="date" min={period.from} max={LAST_DAY} value={period.to} onChange={e => e.target.value && onChange({ from: period.from, to: e.target.value })} className={input} />
      </label>
    </div>
  )
}
