import { useState } from 'react'
import { PlannerBar } from './PlannerBar'
import { PeriodList } from './PeriodList'
import { PeriodStrip } from './PeriodStrip'
import { PlanDetailHead } from './PlanDetailHead'
import { PlanMonths } from './PlanMonths'
import { SidePanel } from '../SidePanel'
import { PanelCollapsed } from '../PanelCollapsed'
import { MoreOptions } from './MoreOptions'
import { PlannerResults } from './PlannerResults'

/**
 * The page the desktop app opens on: a three-step leave planner. Step 1 (the
 * leave periods) is a list on the left; steps 2 and 3 sit on the same line above
 * the breaks table, which updates straight away. On the right, the same Details / Summary panel as
 * the calendar: Details shows the plan on a calendar, Summary is your breaks.
 *
 * Props:
 *   planner                    – usePlanner() result
 *   isSaved                    – (break) => bool
 *   onAdd, onView              – (breaks) => void
 *   onUseRest                  – open the Calendar with the leave that's left
 *   province, onProvinceChange – school province
 *   savedCount, summary        – the Summary tab's count and panel (shared with the calendar)
 *   savedBreaks                – for the collapsed strip's Summary totals
 *   collapsed, onCollapsedChange – the panel collapsed to a strip (shared with the calendar)
 */
const PERIODS_KEY = 'stretchmyleave.periodsFolded'

// Step 1's column: remembered between visits; on a first visit, narrow windows
// (under 1100px, e.g. half a 13-inch screen) start folded into icons.
function initialPeriodsFolded() {
  try {
    const stored = localStorage.getItem(PERIODS_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* storage unavailable — fall back to the window width */ }
  return window.innerWidth < 1100
}

export function OverviewPage({ planner, isSaved, onAdd, onView, onUseRest, province, onProvinceChange, savedCount, summary, savedBreaks, collapsed, onCollapsedChange }) {
  const [tab, setTab] = useState('details')
  const [moreOpen, setMoreOpen] = useState(false)
  const [periodsFolded, setPeriodsFolded] = useState(initialPeriodsFolded)
  const foldPeriods = folded => {
    setPeriodsFolded(folded)
    try { localStorage.setItem(PERIODS_KEY, String(folded)) } catch { /* not remembered */ }
  }
  // Both side columns folded: the three columns fit side by side even on narrow windows.
  const fits = periodsFolded && collapsed
  // The break whose table row is hovered, highlighted in the calendar column.
  const [hovered, setHovered] = useState(null)
  const { period } = planner

  return (
    <>

      {/* Same layout as the calendar: on wide screens one screen tall, each column scrolling on its own. */}
      <div className={`flex gap-5 ${fits ? 'flex-nowrap items-stretch h-full' : 'flex-wrap items-start lg:flex-nowrap lg:items-stretch lg:h-full'}`}>
        {periodsFolded
          ? <PeriodStrip periods={planner.periods} period={period} months={planner.monthChoices} onChangeMonths={planner.changeMonths} selectedId={period.id} onSelect={planner.selectPeriod} onExpand={() => foldPeriods(false)} />
          : <PeriodList periods={planner.periods} period={period} months={planner.monthChoices} onChangeMonths={planner.changeMonths} selectedId={period.id} onSelect={planner.selectPeriod} onCollapse={() => foldPeriods(true)} />}
        <div className={`${fits ? 'flex-1 h-full' : 'flex-[999_1_480px] lg:h-full'} min-w-0 flex flex-col gap-2`}>
          <PlannerBar planner={planner} moreOpen={moreOpen} onMoreToggle={() => setMoreOpen(o => !o)} />
          <article data-tour="results" aria-label={`Plan: ${period.title}`} className="flex-1 min-h-0 rounded-[20px] shadow-sm bg-white flex flex-col overflow-hidden">
            {moreOpen && <MoreOptions planner={planner} province={province} onProvinceChange={onProvinceChange} />}
            <div className="px-4 py-4 flex-1 min-h-0 flex flex-col">
              <PlannerResults planner={planner} isSaved={isSaved} onAdd={list => { planner.markAdded(list); onAdd(list); setTab('summary') }} onView={onView} onUseRest={onUseRest} onHover={setHovered} onRaiseLimit={() => document.getElementById('overview-limit')?.focus()} onOpenSummary={() => setTab('summary')} />
            </div>
          </article>
        </div>
        {collapsed ? (
          <PanelCollapsed
            tab={tab}
            onTabChange={setTab}
            onExpand={onTab => {
              onCollapsedChange(false)
              if (onTab) setTab(onTab)
            }}
            planBreaks={planner.breaks.filter(b => planner.ticked.has(b.startDate))}
            savedBreaks={savedBreaks}
          />
        ) : (
          // Same as the calendar: a "Collapse to icons" bar above the panel.
          <div data-tour="panel" className="w-[300px] xl:w-[340px] shrink-0 h-full flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onCollapsedChange(true)}
              aria-label="Collapse details and summary"
              className="shrink-0 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
            >
              Collapse to icons »
            </button>
            <SidePanel
              width="w-full flex-1 min-h-0"
              tab={tab}
              onTabChange={setTab}
              savedCount={savedCount}
              head={tab === 'details' && (
                <PlanDetailHead period={period} breaks={planner.breaks.filter(b => planner.ticked.has(b.startDate))} onView={onView} />
              )}
              details={planner.calendarBreaks.breaks.length > 0
                ? <PlanMonths bare period={period} {...planner.calendarBreaks} highlight={hovered} />
                : <p className="m-0 text-sm text-slate-600">No breaks to show for these settings.</p>}
              summary={summary}
            />
          </div>
        )}
      </div>
    </>
  )
}
