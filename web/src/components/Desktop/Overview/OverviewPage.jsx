import { useState } from 'react'
import { PlannerBar } from './PlannerBar'
import { PlanMonths, PlanKey } from './PlanMonths'
import { SidePanel } from '../SidePanel'
import { PanelCollapsed } from '../PanelCollapsed'
import { MoreOptions } from './MoreOptions'
import { PlannerResults } from './PlannerResults'

/**
 * The page the desktop app opens on: a three-step leave planner. The steps
 * (period, days off limit, what matters most) sit in one bar above the
 * results, which update straight away. On the right, the same Details / Summary panel as
 * the calendar: Details shows the plan on a calendar, Summary is your breaks.
 *
 * Props:
 *   planner                    – usePlanner() result
 *   isSaved                    – (break) => bool
 *   onAdd, onExport, onView    – (breaks) => void
 *   province, onProvinceChange – school province
 *   savedCount, summary        – the Summary tab's count and panel (shared with the calendar)
 *   savedBreaks                – for the collapsed strip's Summary totals
 *   collapsed, onCollapsedChange – the panel collapsed to a strip (shared with the calendar)
 */
export function OverviewPage({ planner, isSaved, onAdd, onExport, onView, province, onProvinceChange, savedCount, summary, savedBreaks, collapsed, onCollapsedChange }) {
  const [tab, setTab] = useState('details')
  const [moreOpen, setMoreOpen] = useState(false)
  // The break whose table row is hovered, highlighted in the calendar column.
  const [hovered, setHovered] = useState(null)
  const { period } = planner

  return (
    <>

      {/* Same layout as the calendar: on wide screens one screen tall, each column scrolling on its own. */}
      <div className="flex flex-wrap gap-5 items-start lg:flex-nowrap lg:items-stretch lg:h-full">
        <div className="flex-[999_1_520px] min-w-0 flex flex-col gap-3 lg:h-full">
          <PlannerBar planner={planner} moreOpen={moreOpen} onMoreToggle={() => setMoreOpen(o => !o)} />
          <article data-tour="results" aria-label={`Plan: ${period.title}`} className="flex-1 min-h-0 rounded-[20px] shadow-sm bg-white flex flex-col overflow-hidden">
            {moreOpen && <MoreOptions planner={planner} province={province} onProvinceChange={onProvinceChange} />}
            <div className="px-[22px] py-4 flex-1 min-h-0 flex flex-col">
              <PlannerResults planner={planner} isSaved={isSaved} onAdd={list => { onAdd(list); setTab('summary') }} onExport={onExport} onView={onView} onHover={setHovered} />
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
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!planner.breaks.some(b => planner.ticked.has(b.startDate))}
                    onClick={() => onView(planner.breaks.filter(b => planner.ticked.has(b.startDate)))}
                    className="h-10 rounded-xl bg-sky-700 text-white text-sm font-bold disabled:opacity-50"
                  >
                    Go to calendar →
                  </button>
                  <PlanKey />
                </div>
              )}
              details={planner.breaks.length > 0
                ? <PlanMonths bare period={period} breaks={planner.breaks} ticked={planner.ticked} highlight={hovered} />
                : <p className="m-0 text-sm text-slate-600">No breaks to show for these settings.</p>}
              summary={summary}
            />
          </div>
        )}
      </div>
    </>
  )
}
