import { PlanIcon } from './PlanIcon'
import { StatTile } from '../StatTile'
import { StepHeading } from './StepHeading'
import { formatMultiplier } from '../../../utils/breaks'
import { PERIOD_DESCRIPTIONS } from './periodThemes'
import { PeriodMonths } from './PeriodMonths'

// The card's plan at a glance: days off, multiplier, breaks and leave as small tiles.
function QuickStats({ stats }) {
  if (!stats || stats.breaks === 0) return null
  return (
    <span className="flex flex-wrap gap-[3px] mt-1" aria-label={`${stats.daysOff} days off, ${formatMultiplier(stats.multiplier)} multiplier, ${stats.breaks} breaks, ${stats.leave} leave days`}>
      <StatTile tiny kind="total" value={stats.daysOff} title="Days off" />
      <StatTile tiny kind="multiplier" value={formatMultiplier(stats.multiplier)} title="Multiplier" />
      <StatTile tiny kind="breaks" value={stats.breaks} title="Breaks" />
      <StatTile tiny kind="leave" value={stats.leave} title="Leave days used" />
    </span>
  )
}

function PeriodCard({ id, kind, title, subtitle, stats, selected, onSelect }) {
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
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-[13.5px] font-extrabold">{title}</span>
        <span className="text-[11.5px] leading-snug text-slate-600">{PERIOD_DESCRIPTIONS[kind]}</span>
        {subtitle && <span className="text-[11px] text-slate-400">{subtitle}</span>}
        <QuickStats stats={stats} />
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
 * ready-made leave periods, each saying what it is, its dates, and its plan's
 * quick stats. The list scrolls on its own.
 *
 * Props:
 *   periods    – planPeriods() result
 *   period     – the period being planned (for From / To)
 *   months     – the months Custom can use ('YYYY-MM')
 *   onChangeMonths – ({ fromMonth, toMonth }) => void; makes the plan Custom
 *   selectedId – 'custom' or a period id
 *   onSelect   – (id) => void
 *   cardStats  – { [periodId]: { breaks, leave, daysOff, multiplier } }
 */
export function PeriodList({ periods, period, months, onChangeMonths, selectedId, onSelect, cardStats }) {
  return (
    <div className="w-[270px] shrink-0 flex flex-col gap-2 lg:h-full min-h-0">
      <div className="h-10 shrink-0 flex items-center"><StepHeading number={1}>Pick a leave period</StepHeading></div>
      <nav data-tour="period" aria-label="Leave periods" className="flex-1 min-h-0 flex flex-col gap-1.5 lg:overflow-y-auto lg:pr-1 lg:pb-2 [&>*]:shrink-0">
        <CustomCard period={period} selected={selectedId === 'custom'} onSelect={onSelect} months={months} onChangeMonths={onChangeMonths} />
        {periods.map(p => (
          <PeriodCard key={p.id} {...p} stats={cardStats[p.id]} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  )
}
