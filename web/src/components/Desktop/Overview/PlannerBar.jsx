import { MAX_LEAVE } from '../../../utils/planner'
import { StepHeading } from './StepHeading'
import { GoalChoice } from './GoalChoice'

const select = 'h-9 border border-slate-300 rounded-xl px-2.5 text-sm font-bold bg-white cursor-pointer'

/**
 * Steps 2 and 3 of the Overview on one line (in line with step 1's heading):
 * the days off limit (a dropdown) and the aim, with Advanced options (a down
 * arrow, with a count of options on) on the right.
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
        aria-label={planner.moreCount ? `Advanced options (${planner.moreCount} on)` : 'Advanced options'}
        title="Advanced options: school holidays, months to avoid or include"
        className={`relative ml-auto w-9 h-9 rounded-xl border text-base ${moreOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`mx-auto transition-transform ${moreOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
        {/* How many options are on, like the calendar's filter dots. */}
        {planner.moreCount > 0 && <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] font-extrabold leading-[14px]">{planner.moreCount}</span>}
      </button>
    </section>
  )
}
