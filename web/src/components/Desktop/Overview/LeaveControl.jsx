import { StepHeading } from './StepHeading'
import { LeaveBlocks, LeaveFraction } from '../LeaveBlocks'

/**
 * Step 2: leave days as "10 / 10▾ limit" with ten blocks, like the calendar
 * card. The most you can pick is your leave limit, or the workdays in the
 * period if fewer (blocks past that are striped).
 *
 * Props: value, max, onChange, idPrefix, phone
 *        limit, onLimitChange – your leave limit (shared with the calendar)
 */
export function LeaveControl({ value, max, onChange, idPrefix, phone = false, limit, onLimitChange }) {
  const note = max < limit && <span className="text-[11.5px] text-slate-600">Max <b>{max} leave days</b> for these dates</span>

  if (!phone) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <StepHeading number={2}>Leave days</StepHeading>
          <LeaveFraction value={value} limit={limit} onLimitChange={onLimitChange} idPrefix={idPrefix} size="md" />
          <LeaveBlocks compact value={value} onChange={onChange} max={max} />
        </div>
        {note}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2.5">
        <StepHeading phone number={2}>Leave days</StepHeading>
        <LeaveFraction value={value} limit={limit} onLimitChange={onLimitChange} idPrefix={idPrefix} size="md" />
      </div>
      <LeaveBlocks value={value} onChange={onChange} max={max} />
      {note}
    </div>
  )
}
