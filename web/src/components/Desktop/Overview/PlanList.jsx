import { PlanIcon } from './PlanIcon'
import { fmtShortRange } from '../../../utils/dateFormat'
import { summariseBreaks, formatMultiplier } from '../../../utils/breaks'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthOf = date => MONTHS[Number(date.slice(5, 7)) - 1]

function whenLabel(breaks) {
  const first = breaks[0]
  if (breaks.length === 1) return fmtShortRange(first.startDate, first.endDate)
  const start = first.startDate
  const end = breaks[breaks.length - 1].endDate
  // Short years only when both ends share a month name ("Dec '26 – Dec '27"),
  // so the label stays short enough to fit on one line.
  const span = monthOf(start) === monthOf(end) && start.slice(0, 4) !== end.slice(0, 4)
    ? `${monthOf(start)} '${start.slice(2, 4)} – ${monthOf(end)} '${end.slice(2, 4)}`
    : `${monthOf(start)} – ${monthOf(end)}`
  return `${breaks.length} breaks · ${span}`
}

/**
 * Left column of the Overview: one compact row per plan. Clicking a row
 * shows it in the details panel; the three stats sit in fixed-width boxes
 * so they line up down the list.
 *
 * Props:
 *   plans       – computePlans() result
 *   selectedId  – id of the plan shown in the details panel
 *   onSelect    – (id) => void
 */
export function PlanList({ plans, selectedId, onSelect }) {
  return (
    <nav aria-label="Plans" className="flex-[1_1_340px] max-w-[420px] min-w-0 flex flex-col gap-1.5">
      {plans.map(plan => {
        const totals = summariseBreaks(plan.breaks)
        const selected = plan.id === selectedId
        return (
          <button
            key={plan.id}
            type="button"
            aria-current={selected ? 'true' : undefined}
            onClick={() => onSelect(plan.id)}
            className={[
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left border-2',
              selected ? 'bg-sky-50 border-sky-700' : 'bg-white border-transparent shadow-sm hover:border-slate-200',
            ].join(' ')}
          >
            <PlanIcon kind={plan.kind} />
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-sm font-extrabold truncate">{plan.title}</span>
              <span className="text-xs text-slate-600 truncate">{whenLabel(plan.breaks)}</span>
            </span>
            <span
              aria-label={`${totals.leaveUsed} leave days, ${totals.daysOff} days off, ${formatMultiplier(totals.multiplier)} average`}
              className="shrink-0 flex gap-1 text-xs font-extrabold"
            >
              <span className="h-6 min-w-[30px] px-1.5 rounded-md bg-sky-100 text-sky-800 inline-flex items-center justify-center">{totals.leaveUsed}</span>
              <span className="h-6 min-w-[30px] px-1.5 rounded-md bg-indigo-100 text-indigo-800 inline-flex items-center justify-center">{totals.daysOff}</span>
              <span className="h-6 min-w-[40px] px-1.5 rounded-md bg-amber-100 text-amber-800 inline-flex items-center justify-center">{formatMultiplier(totals.multiplier)}</span>
            </span>
          </button>
        )
      })}
      <div aria-hidden="true" className="flex justify-end gap-1 px-3 pt-1 text-[11px] text-slate-500">
        <span className="min-w-[30px] text-center">leave</span>
        <span className="min-w-[30px] text-center">off</span>
        <span className="min-w-[40px] text-center">avg ×</span>
      </div>
    </nav>
  )
}
