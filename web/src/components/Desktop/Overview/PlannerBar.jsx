import { StepHeading } from './StepHeading'
import { LimitPicker } from './LimitPicker'

/**
 * Step 2 of the Overview (in line with step 1's heading): the days off limit
 * as numbers, the period's recommended number marked REC, with Advanced
 * options (a down arrow, with a count of options on) on the right. There's no
 * aim to pick: the leave days decide (see RecLine).
 *
 * Props: planner – usePlanner() result; moreOpen, onMoreToggle – Advanced options
 */
export function PlannerBar({ planner, moreOpen, onMoreToggle }) {
  return (
    <section aria-label="Plan settings" className="min-h-10 shrink-0 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div data-tour="limit" className="flex items-center gap-2.5">
        <StepHeading number={2}>Days off limit</StepHeading>
        <LimitPicker value={planner.leaveLimit} onChange={planner.setLimitAndLeave} rec={planner.rec?.leave} />
        {planner.maxLeave < planner.leaveLimit && (
          <span className="text-[11.5px] text-slate-600">
            {planner.leaveLeft < planner.leaveLimit && planner.maxLeave === Math.min(planner.leaveLeft, 10) ? `Uses ${planner.maxLeave}: what's left after your Summary` : `Uses ${planner.maxLeave}: all the workdays in these dates`}
          </span>
        )}
      </div>
      <button
        type="button"
        data-tour="advanced"
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
