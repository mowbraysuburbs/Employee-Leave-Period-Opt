import { MAX_LEAVE } from '../../../utils/planner'
import { StepHeading } from './StepHeading'

/**
 * Step 2: leave days with − / + and a slider, like the calendar rail. The
 * most you can pick is 10, or the workdays in the period if that's fewer.
 *
 * Props: value, max, onChange, idPrefix, phone
 */
export function LeaveControl({ value, max, onChange, idPrefix, phone = false }) {
  const buttons = (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Fewer leave days" disabled={value <= 1} onClick={() => onChange(value - 1)} className="w-7 h-7 rounded-full bg-slate-200 text-base font-semibold disabled:opacity-40">−</button>
      <span className="w-7 text-center text-[22px] font-extrabold">{value}</span>
      <button type="button" aria-label="More leave days" disabled={value >= max} onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full bg-slate-900 text-white text-base font-semibold disabled:opacity-40">+</button>
    </div>
  )
  const slider = (
    <input
      id={`${idPrefix}-leave`}
      type="range"
      min={1}
      max={max}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={`accent-slate-900 ${phone ? 'w-full' : 'w-24'}`}
    />
  )
  const note = max < MAX_LEAVE && <span className="text-[11.5px] text-slate-600">Max <b>{max} leave days</b> for these dates</span>

  // Desktop: everything on one compact row.
  if (!phone) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <StepHeading number={2} htmlFor={`${idPrefix}-leave`}>Leave days</StepHeading>
          {buttons}
          {slider}
        </div>
        {note}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <StepHeading phone number={2} htmlFor={`${idPrefix}-leave`}>Leave days</StepHeading>
        <div className="ml-auto">{buttons}</div>
      </div>
      {slider}
      {note}
    </div>
  )
}
