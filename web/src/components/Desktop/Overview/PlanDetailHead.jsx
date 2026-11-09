import { StatTile } from '../StatTile'
import { PlanKey } from './PlanMonths'
import { formatMultiplier } from '../../../utils/breaks'
import { summarise } from '../../../utils/planner'
import { fmtShortRange } from '../../../utils/dateFormat'

/**
 * The pinned top of the Overview's Details: Go to calendar, the plan's name and
 * dates, its four stats (the same tiles as the calendar's Details, worked out
 * from the ticked breaks), then the colour key.
 *
 * Props: period, breaks (the ticked ones), onView
 */
export function PlanDetailHead({ period, breaks, onView }) {
  const t = summarise(breaks)
  const count = breaks.length === 1 ? '1 break' : `${breaks.length} breaks`
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        disabled={breaks.length === 0}
        onClick={() => onView(breaks)}
        className="h-10 rounded-xl bg-sky-700 text-white text-sm font-bold disabled:opacity-50"
      >
        Go to calendar →
      </button>
      <div className="text-center">
        <h2 className="m-0 text-[14.5px] font-bold">{period.title} · {count}</h2>
        <span className="text-[11.5px] text-slate-500">{fmtShortRange(period.from, period.to)}</span>
      </div>
      {/* One row of four: the panel is narrow, so a 2 × 2 grid wasted the sides. */}
      <div className="grid grid-cols-4 gap-1">
        <StatTile kind="leave" value={t.leave} caption="leave days" compact />
        <StatTile kind="free" value={`+${t.daysOff - t.leave}`} caption="free days" compact />
        <StatTile kind="total" value={t.daysOff} caption="days off" compact />
        <StatTile kind="multiplier" value={formatMultiplier(t.multiplier)} caption="multiplier" compact />
      </div>
      <PlanKey />
    </div>
  )
}
