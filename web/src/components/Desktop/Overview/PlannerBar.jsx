import { OverviewLeaveCard } from './OverviewLeaveCard'

/**
 * Step 2 of the Overview, in line with step 1's heading: the leave card
 * (OverviewLeaveCard) and, beside it, Advanced filters in its own small
 * window ("Advanced" over "filters", with "Off" or how many are on). The
 * filters open above the plan.
 *
 * Props: planner – usePlanner() result; moreOpen, onMoreToggle – Advanced filters
 */
export function PlannerBar({ planner, moreOpen, onMoreToggle }) {
  const on = planner.moreCount
  return (
    <section aria-label="Plan settings" className="shrink-0 flex gap-2">
      <OverviewLeaveCard planner={planner} />
      <button
        type="button"
        data-tour="advanced"
        aria-expanded={moreOpen}
        onClick={onMoreToggle}
        aria-label={on ? `Advanced filters (${on} on)` : 'Advanced filters'}
        title="Advanced filters: school holidays, months to avoid or include"
        className={`shrink-0 w-[72px] rounded-2xl border-[1.5px] flex flex-col items-center justify-center gap-0.5 text-center ${moreOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-900 hover:border-slate-500'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="9" cy="6" r="2" fill="currentColor" /><circle cx="15" cy="12" r="2" fill="currentColor" /><circle cx="8" cy="18" r="2" fill="currentColor" /></svg>
        <span className="text-[11px] font-extrabold leading-tight">Advanced<br />filters</span>
        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${moreOpen ? 'text-slate-300' : 'text-slate-500'}`}>
          {on ? <span className="min-w-4 h-4 px-1 rounded-full bg-sky-500 text-white text-[9.5px] leading-4">{on}</span> : 'Off'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className={moreOpen ? 'rotate-180' : ''}><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </button>
    </section>
  )
}
