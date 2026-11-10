import { PlanIcon } from './PlanIcon'
import { StepHeading } from './StepHeading'
import { PeriodMonths } from './PeriodMonths'

// Three lines: the title, which holidays are in it (one line), and how many with the dates.
function PeriodCard({ id, kind, title, holidayLine, dates, holidays, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(id)}
      className={[
        'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-2xl text-left border-2 bg-white',
        selected ? 'border-slate-900 shadow-md' : 'border-transparent shadow-sm hover:border-slate-300',
      ].join(' ')}
    >
      <PlanIcon kind={kind} size={30} />
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[13.5px] font-extrabold leading-[18px]">{title}</span>
        <span title={holidayLine} className="truncate text-[12px] leading-4 text-slate-700">{holidayLine}</span>
        <span className="flex items-center gap-1.5 min-w-0 leading-4">
          {holidays > 0 && <span className="shrink-0 h-4 px-1.5 rounded-md bg-orange-100 text-orange-800 text-[10.5px] font-extrabold leading-4">{holidays} holiday{holidays === 1 ? '' : 's'}</span>}
          <span className="truncate text-[11px] text-slate-500">{dates}</span>
        </span>
      </span>
    </button>
  )
}

// Custom dates: From / To months always show the months being planned (greyed
// when another period is picked); changing one, or tapping the title, picks Custom.
function CustomCard({ period, selected, onSelect, months, onChangeMonths }) {
  return (
    <div className={`w-full flex flex-col gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 ${selected ? 'border-slate-900 shadow-md' : 'border-dashed border-slate-300'}`}>
      <button type="button" aria-current={selected ? 'true' : undefined} onClick={() => onSelect('custom')} className="flex items-center gap-2.5 text-left">
        <PlanIcon kind="custom" size={30} />
        <span className="text-[13.5px] font-extrabold">Custom dates</span>
      </button>
      <PeriodMonths period={period} choices={months} onChange={onChangeMonths} active={selected} />
    </div>
  )
}

/**
 * Step 1 of the Overview planner: the Custom dates card (From / To months), then the
 * ready-made leave periods, each in three lines: title, which holidays are in
 * it, and how many with the dates. The list scrolls on its own.
 *
 * Props:
 *   periods    – planPeriods() result
 *   period     – the period being planned (for From / To)
 *   months     – the months Custom can use ('YYYY-MM')
 *   onChangeMonths – ({ fromMonth, toMonth }) => void; makes the plan Custom
 *   selectedId – 'custom' or a period id
 *   onSelect   – (id) => void
 *   onCollapse – folds the column into icons (PeriodStrip)
 */
export function PeriodList({ periods, period, months, onChangeMonths, selectedId, onSelect, onCollapse }) {
  return (
    <div className="w-[270px] shrink-0 flex flex-col gap-2 lg:h-full min-h-0">
      <div className="h-10 shrink-0 flex items-center gap-2">
        <StepHeading number={1}>Pick a leave period</StepHeading>
        {onCollapse && (
          <button type="button" onClick={onCollapse} aria-label="Fold the leave periods into icons" title="Fold into icons" className="ml-auto w-10 h-9 rounded-xl border border-slate-300 bg-white text-slate-700 text-[15px] font-extrabold hover:border-slate-500">«</button>
        )}
      </div>
      <nav data-tour="period" aria-label="Leave periods" className="flex-1 min-h-0 flex flex-col gap-1.5 lg:overflow-y-auto lg:pr-1 lg:pb-2 [&>*]:shrink-0">
        <CustomCard period={period} selected={selectedId === 'custom'} onSelect={onSelect} months={months} onChangeMonths={onChangeMonths} />
        {periods.map(p => (
          <PeriodCard key={p.id} {...p} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  )
}
