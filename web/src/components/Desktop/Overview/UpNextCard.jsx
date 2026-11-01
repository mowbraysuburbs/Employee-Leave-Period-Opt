import { StatTile } from '../StatTile'
import { BreakWeeks } from '../BreakWeeks'
import { BreakDaysTable } from '../BreakDaysTable'
import { fmtDay, fmtDayRange } from '../../../utils/dateFormat'
import { formatMultiplier } from '../../../utils/breaks'

/**
 * The featured card at the top of Overview: the best break around the next
 * public holiday, with its weeks and a day-by-day table.
 *
 * Props:
 *   holiday – { date, name }
 *   brk     – the break
 *   isSaved, onAdd, onView
 */
export function UpNextCard({ holiday, brk, isSaved, onAdd, onView }) {
  return (
    <article aria-label="Up next" className="bg-white border-2 border-sky-700 rounded-[22px] p-6 shadow-md flex flex-wrap gap-7">
      <div className="flex-[1_1_300px] min-w-0 flex flex-col gap-3.5">
        <span className="self-start inline-flex items-center px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-[13px] font-extrabold">
          Up next · {holiday.name}
        </span>
        <h2 className="m-0 text-3xl leading-tight font-extrabold tracking-tight">{fmtDayRange(brk.startDate, brk.endDate)}</h2>
        <p className="m-0 text-[15px] text-slate-600">The best break around the next public holiday, {fmtDay(holiday.date)}.</p>
        <div className="flex flex-wrap gap-1.5">
          <StatTile kind="leave" value={brk.leaveDays} label="leave" />
          <StatTile kind="free" value={`+${brk.daysOff - brk.leaveDays}`} label="free" />
          <StatTile kind="multiplier" value={formatMultiplier(brk.multiplier)} />
          <StatTile kind="total" value={brk.daysOff} label="days off" />
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={onAdd}
            disabled={isSaved}
            className={`flex-1 h-11 rounded-xl text-sm font-bold ${isSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
          >
            {isSaved ? 'Added ✓' : 'Add'}
          </button>
          <button type="button" onClick={onView} className="flex-1 h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold">
            View on calendar →
          </button>
        </div>
      </div>
      <div className="flex-[1_1_300px] min-w-0 flex flex-col gap-3">
        <BreakWeeks brk={brk} />
        <BreakDaysTable brk={brk} />
      </div>
    </article>
  )
}
