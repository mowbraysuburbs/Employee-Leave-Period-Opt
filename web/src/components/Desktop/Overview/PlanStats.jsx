import { formatMultiplier } from '../../../utils/breaks'

function Stat({ value, label, className }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${className}`}>
      <div className="text-[21px] font-extrabold">{value}</div>
      <div className="text-xs truncate">{label}</div>
    </div>
  )
}

const countDays = (breaks, type) => breaks.reduce((t, b) => t + b.days.filter(d => d.type === type).length, 0)

/**
 * The details panel's stat row, worked out from the ticked breaks.
 *
 * Props:
 *   breaks – the ticked breaks
 *   total  – how many breaks the plan has (shows "2/3" when some are unticked)
 *   compact – phones: just days off, leave used and value in one row
 */
export function PlanStats({ breaks, total, compact = false }) {
  const leave = breaks.reduce((t, b) => t + b.leaveDays, 0)
  const daysOff = breaks.reduce((t, b) => t + b.daysOff, 0)

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <Stat value={daysOff} label="days off" className="bg-indigo-100 text-indigo-800" />
        <Stat value={leave} label="leave used" className="bg-sky-100 text-sky-800" />
        <Stat value={leave ? formatMultiplier(daysOff / leave) : '–'} label="value" className="bg-amber-100 text-amber-800" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] gap-2">
      <Stat value={total > 1 ? `${breaks.length}/${total}` : breaks.length} label={total > 1 ? 'breaks ticked' : 'break'} className="bg-slate-100 text-slate-700" />
      <Stat value={leave} label="leave used" className="bg-sky-100 text-sky-800" />
      <Stat value={countDays(breaks, 'public_holiday')} label="public holidays" className="bg-orange-100 text-orange-800" />
      <Stat value={countDays(breaks, 'weekend')} label="weekend days" className="bg-slate-200 text-slate-700" />
      <Stat value={daysOff} label="days off" className="bg-indigo-100 text-indigo-800" />
      <Stat value={leave ? formatMultiplier(daysOff / leave) : '–'} label="avg multiplier" className="bg-amber-100 text-amber-800" />
    </div>
  )
}
