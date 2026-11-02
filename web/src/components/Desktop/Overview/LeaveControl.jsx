import { MAX_LEAVE } from '../../../utils/planner'

/**
 * Step 2: leave days with − / + and a slider, like the calendar rail. The
 * most you can pick is 10, or the workdays in the period if that's fewer.
 *
 * Props: value, max, onChange, idPrefix, phone
 */
export function LeaveControl({ value, max, onChange, idPrefix, phone = false }) {
  return (
    <div className={`flex flex-col gap-1.5 ${phone ? '' : 'min-w-[200px]'}`}>
      <div className="flex items-center gap-2.5">
        <label htmlFor={`${idPrefix}-leave`} className={phone ? 'text-[13px] font-bold' : 'text-xs font-extrabold text-slate-500 uppercase tracking-wide'}>
          {phone ? 'Leave days' : '2 · Leave days'}
        </label>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-label="Fewer leave days" disabled={value <= 1} onClick={() => onChange(value - 1)} className="w-7 h-7 rounded-full bg-slate-200 text-base font-semibold disabled:opacity-40">−</button>
          <span className="w-8 text-center text-2xl font-extrabold">{value}</span>
          <button type="button" aria-label="More leave days" disabled={value >= max} onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full bg-slate-900 text-white text-base font-semibold disabled:opacity-40">+</button>
        </div>
      </div>
      <input
        id={`${idPrefix}-leave`}
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-slate-900"
      />
      {max < MAX_LEAVE && <span className="text-[11.5px] text-slate-600">Max <b>{max} leave days</b> for these dates</span>}
    </div>
  )
}
