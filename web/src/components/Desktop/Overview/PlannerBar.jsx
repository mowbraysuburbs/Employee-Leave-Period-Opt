import { MAX_LEAVE } from '../../../utils/planner'
import { StepHeading } from './StepHeading'
import { GoalChoice } from './GoalChoice'

const select = 'h-9 border border-slate-300 rounded-xl px-2.5 text-sm font-bold bg-white cursor-pointer'

/**
 * Steps 2 and 3 of the Overview on one line (in line with step 1's heading):
 * the days off limit (a dropdown) and the aim, with Advanced options (⚙) on
 * the right.
 *
 * Props: planner – usePlanner() result; moreOpen, onMoreToggle – Advanced options
 */
export function PlannerBar({ planner, moreOpen, onMoreToggle }) {
  return (
    <section aria-label="Plan settings" className="min-h-10 shrink-0 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div data-tour="limit" className="flex items-center gap-2.5">
        <StepHeading number={2} htmlFor="planner-limit">Days off limit</StepHeading>
        <select id="planner-limit" value={planner.leaveLimit} onChange={e => planner.setLimitAndLeave(Number(e.target.value))} className={select}>
          {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {planner.maxLeave < planner.leaveLimit && <span className="text-[11.5px] text-slate-600">Uses {planner.maxLeave}: all the workdays in these dates</span>}
      </div>
      <div data-tour="goal"><GoalChoice plain label="Aim" goals={planner.goals} value={planner.goal} onChange={planner.setGoal} /></div>
      <button
        type="button"
        aria-expanded={moreOpen}
        onClick={onMoreToggle}
        aria-label="Advanced options"
        title="Advanced options: school holidays, months to avoid or include"
        className={`relative ml-auto w-9 h-9 rounded-xl border text-base ${moreOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'}`}
      >
        ⚙
        {planner.moreCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-sky-700 text-white text-[10px] font-bold leading-4">{planner.moreCount}</span>}
      </button>
    </section>
  )
}
