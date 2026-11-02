import { useState } from 'react'
import { PlanIcon } from '../Desktop/Overview/PlanIcon'
import { LeaveControl } from '../Desktop/Overview/LeaveControl'
import { GoalChoice } from '../Desktop/Overview/GoalChoice'
import { PlanMonths } from '../Desktop/Overview/PlanMonths'
import { MoreOptions } from '../Desktop/Overview/MoreOptions'
import { PlannerResults } from '../Desktop/Overview/PlannerResults'
import { CustomDates } from '../Desktop/Overview/CustomDates'
import { PERIOD_THEMES, STRIP_THEMES } from '../Desktop/Overview/periodThemes'
import { BottomSheet } from './BottomSheet'

// Short labels for the period strip.
const SHORT = { custom: 'Custom', next: 'Up next', xmas: 'Christmas', easter: 'Easter', school: 'School', three: '3 months', six: '6 months', rest: 'This year' }

/**
 * The phone Overview: the planner's settings in a card at the top, the plan
 * underneath (only the breaks scroll), and a strip of colourful leave periods
 * above the bottom tabs, within thumb reach. More options opens as a sheet.
 *
 * Props: the same as OverviewPage.
 */
export function MobileOverview({ planner, isSaved, onAdd, onExport, onView, province, onProvinceChange }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const { period } = planner
  const strip = [{ id: 'custom', kind: 'custom', title: 'Custom' }, ...planner.periods]

  return (
    <>
      <main className="flex-1 min-h-0 p-3 flex flex-col gap-2.5">
        <section aria-label="Plan settings" className={`shrink-0 rounded-2xl p-3 flex flex-col gap-2.5 ${STRIP_THEMES[period.kind]}`}>
          <div className="flex items-center justify-between gap-2">
            <h1 className="m-0 text-base font-extrabold truncate">{period.title}</h1>
            <button type="button" onClick={() => setMoreOpen(true)} className="shrink-0 text-[13px] font-bold text-sky-700">
              Advanced ▾{planner.moreCount > 0 && <span className="ml-1 px-1.5 rounded-md bg-sky-700 text-white text-[11px]">{planner.moreCount}</span>}
            </button>
          </div>
          {period.id === 'custom' && <CustomDates phone value={planner.custom} onChange={planner.setCustom} />}
          <LeaveControl phone value={planner.leave} max={planner.maxLeave} onChange={planner.setLeave} idPrefix="phone-planner" />
          <GoalChoice phone goals={planner.goals} value={planner.goal} onChange={planner.setGoal} />
        </section>

        <section aria-label="Your plan" className="flex-1 min-h-0 rounded-2xl bg-white shadow-sm p-3 flex flex-col">
          <PlannerResults
            phone
            planner={planner}
            isSaved={isSaved}
            onAdd={onAdd}
            onExport={onExport}
            onView={onView}
            calendar={<PlanMonths phone period={period} breaks={planner.breaks} ticked={planner.ticked} />}
          />
        </section>
      </main>

      <nav aria-label="Leave periods" className="shrink-0 flex gap-1 overflow-x-auto px-2 pt-2 pb-1.5 bg-white border-t border-slate-200 [scrollbar-width:none]">
        {strip.map(p => {
          const on = p.id === period.id
          return (
            <button
              key={p.id}
              type="button"
              aria-label={p.title}
              aria-pressed={on}
              onClick={() => planner.selectPeriod(p.id)}
              className={`shrink-0 w-[64px] pt-1 pb-0.5 rounded-xl border-2 flex flex-col items-center gap-0.5 ${on ? `border-slate-900 ${PERIOD_THEMES[p.kind]}` : 'border-transparent text-slate-700'}`}
            >
              <PlanIcon kind={p.kind} size={30} />
              <span className="text-[10px] font-bold whitespace-nowrap">{SHORT[p.kind] ?? p.title}</span>
            </button>
          )
        })}
      </nav>

      {moreOpen && (
        <BottomSheet label="Advanced options" title="Advanced options" backdrop onClose={() => setMoreOpen(false)}>
          <div className="px-4 pb-4 flex flex-col gap-4">
            <MoreOptions phone planner={planner} province={province} onProvinceChange={onProvinceChange} />
            <button type="button" onClick={() => setMoreOpen(false)} className="h-12 rounded-2xl bg-slate-900 text-white text-[15px] font-bold">Show results</button>
          </div>
        </BottomSheet>
      )}
    </>
  )
}
