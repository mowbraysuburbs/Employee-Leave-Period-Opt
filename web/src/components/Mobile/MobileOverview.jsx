import { PlanDetails } from '../Desktop/Overview/PlanDetails'
import { PlanIcon } from '../Desktop/Overview/PlanIcon'
import { ProvincePicker } from '../Desktop/ProvincePicker'

// Short labels for the icon strip; year plans show just their year.
function shortLabel(plan) {
  const labels = { next: 'Up next', three: '3 months', xmas: 'Christmas', easter: 'Easter', school: 'School', trip: 'Big trip' }
  return labels[plan.kind] ?? plan.title.match(/\d{4}/)?.[0] ?? plan.title
}

/**
 * The phone Overview: the selected plan's details fill the screen, and a
 * strip of plan icons sits above the bottom tabs (within thumb reach) to
 * switch plans with one tap, so the details never need a long scroll.
 *
 * Props: the same plan props as OverviewPage.
 */
export function MobileOverview({ plans, selectedPlan, onSelect, ticked, onToggle, onToggleAll, isSaved, onAdd, onExport, onView, province, onProvinceChange }) {
  if (plans.length === 0) {
    return (
      <main className="flex-1 min-h-0 p-4">
        <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No public or school holidays fall in this period. Try widening the dates.
        </div>
      </main>
    )
  }

  const chosen = selectedPlan ? selectedPlan.breaks.filter(b => ticked.has(b.startDate)) : []

  return (
    <>
      <main className="flex-1 min-h-0 p-3 flex flex-col">
        {selectedPlan && (
          <PlanDetails
            phone
            plan={selectedPlan}
            ticked={ticked}
            onToggle={onToggle}
            onToggleAll={onToggleAll}
            allSaved={chosen.length > 0 && chosen.every(isSaved)}
            onAdd={onAdd}
            onExport={onExport}
            onView={onView}
            topSlot={selectedPlan.kind === 'school' ? <ProvincePicker compact id="phone-overview-province" value={province} onChange={onProvinceChange} /> : null}
          />
        )}
      </main>

      <nav aria-label="Plans" className="shrink-0 flex gap-1 overflow-x-auto px-2 pt-2 pb-1.5 bg-white border-t border-slate-200 [scrollbar-width:none]">
        {plans.map(plan => {
          const on = plan.id === selectedPlan?.id
          return (
            <button
              key={plan.id}
              type="button"
              aria-label={plan.title}
              aria-pressed={on}
              onClick={() => onSelect(plan.id)}
              className={`shrink-0 w-[66px] pt-1 pb-0.5 rounded-xl border-2 flex flex-col items-center gap-0.5 ${on ? 'border-sky-700 bg-sky-50 text-sky-800' : 'border-transparent text-slate-700'}`}
            >
              <PlanIcon kind={plan.kind} size={32} />
              <span className="text-[10px] font-bold whitespace-nowrap">{shortLabel(plan)}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
