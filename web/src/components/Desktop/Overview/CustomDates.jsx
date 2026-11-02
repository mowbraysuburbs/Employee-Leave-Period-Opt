import { TODAY } from '../../../hooks/useLeavePlanner'
import { addDays } from '../../../utils/dateFormat'

// The holiday data runs to the end of 2028.
const LAST_DAY = '2028-12-31'
const input = 'h-9 border border-slate-300 rounded-lg px-2 text-sm font-medium bg-white'

/**
 * First and last day for the Custom leave period.
 *
 * Props: value { from, to }, onChange({ from, to }), phone
 */
export function CustomDates({ value, onChange, phone = false }) {
  const first = addDays(TODAY, 1)
  return (
    <div role="group" aria-label="Your leave period" className={`relative z-10 grid gap-2 ${phone ? 'grid-cols-2' : 'grid-cols-[150px_150px]'}`}>
      <label className="flex flex-col gap-1 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
        First day
        <input type="date" min={first} max={value.to} value={value.from} onChange={e => e.target.value && onChange({ ...value, from: e.target.value })} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
        Last day
        <input type="date" min={value.from} max={LAST_DAY} value={value.to} onChange={e => e.target.value && onChange({ ...value, to: e.target.value })} className={input} />
      </label>
    </div>
  )
}
