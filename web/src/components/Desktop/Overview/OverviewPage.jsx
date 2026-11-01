import { PlanList } from './PlanList'
import { PlanDetails } from './PlanDetails'
import { PeriodPicker } from '../PeriodPicker'
import { ProvincePicker } from '../ProvincePicker'
import { EventsComingSoon } from '../EventsComingSoon'
import { OVERVIEW_LEAVE } from '../../../utils/plans'

/**
 * The page the desktop app opens on: plans on the left, the selected plan in
 * full on the right. Always based on 10 leave days; the date period drives
 * every plan.
 *
 * Props:
 *   plans, selectedPlan, onSelect
 *   period                       – PeriodPicker props (from, to, minDate, …)
 *   ticked, onToggle, onToggleAll – tick boxes for the selected plan
 *   isSaved                      – (break) => bool
 *   onAdd, onExport, onView      – (breaks) => void
 *   province, onProvinceChange   – school province, shown on School run
 *   eventsSelected               – the Events row is selected (shows its coming-soon panel)
 */
export function OverviewPage({ plans, selectedPlan, onSelect, period, ticked, onToggle, onToggleAll, isSaved, onAdd, onExport, onView, province, onProvinceChange, eventsSelected }) {
  const chosen = selectedPlan ? selectedPlan.breaks.filter(b => ticked.has(b.startDate)) : []

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-tight">Your best breaks</h1>
          <p className="m-0 mt-1.5 text-[15px] text-slate-600">
            Based on <strong className="text-slate-900">{OVERVIEW_LEAVE} leave days</strong>. Pick a plan to see it in full; fine-tune dates on the calendar.
          </p>
        </div>
        <PeriodPicker idPrefix="overview-period" {...period} />
      </section>

      {plans.length === 0 ? (
        <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No public or school holidays fall in this period. Try widening the dates.
        </div>
      ) : (
        <div className="flex flex-wrap gap-[18px] items-start">
          <PlanList plans={plans} selectedId={eventsSelected ? 'events' : selectedPlan?.id} onSelect={onSelect} />
          {eventsSelected && <EventsComingSoon />}
          {selectedPlan && (
            <PlanDetails
              plan={selectedPlan}
              ticked={ticked}
              onToggle={onToggle}
              onToggleAll={onToggleAll}
              allSaved={chosen.length > 0 && chosen.every(isSaved)}
              onAdd={onAdd}
              onExport={onExport}
              onView={onView}
              topSlot={selectedPlan.kind === 'school' ? <ProvincePicker value={province} onChange={onProvinceChange} /> : null}
            />
          )}
        </div>
      )}
    </>
  )
}
