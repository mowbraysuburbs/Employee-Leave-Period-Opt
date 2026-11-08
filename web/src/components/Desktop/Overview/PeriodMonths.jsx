import { monthLabel } from '../../../utils/planner'

const caption = 'text-[10px] font-extrabold text-slate-500 uppercase tracking-wide'

// One month dropdown. A month that isn't a choice (this month with too few
// workdays left, or a picked period's month) still shows, greyed.
function MonthSelect({ id, label, value, choices, onChange, active }) {
  const options = choices.includes(value) ? choices : [value, ...choices].sort()
  return (
    <label htmlFor={id} className="flex flex-col gap-0.5 min-w-0">
      <span className={caption}>{label}</span>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full h-9 border rounded-lg px-1.5 text-[12px] font-bold bg-white ${active ? 'border-sky-700 text-slate-900' : 'border-slate-300 text-slate-500'}`}
      >
        {options.map(m => (
          <option key={m} value={m} disabled={!choices.includes(m)}>
            {monthLabel(m, true)}{choices.includes(m) ? '' : ' (too few workdays)'}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * From / To months of the period being planned, in the Custom dates card.
 * They show whichever period is picked (greyed unless Custom); changing one
 * picks Custom with whole months. The other follows so From ≤ To.
 *
 * Props:
 *   period          – { from, to } being planned
 *   choices         – 'YYYY-MM' months Custom can use
 *   onChange        – ({ fromMonth, toMonth }) => void
 *   active          – Custom is picked
 *   idPrefix        – keeps ids unique (desktop / phone)
 */
export function PeriodMonths({ period, choices, onChange, active, idPrefix = 'overview' }) {
  const fromMonth = period.from.slice(0, 7)
  const toMonth = period.to.slice(0, 7)
  return (
    <div role="group" aria-label="Your leave period (months)" className="grid grid-cols-2 gap-1.5">
      <MonthSelect
        id={`${idPrefix}-from-month`}
        label="From"
        value={fromMonth}
        choices={choices}
        active={active}
        onChange={m => onChange({ fromMonth: m, toMonth: toMonth < m || !choices.includes(toMonth) ? m : toMonth })}
      />
      <MonthSelect
        id={`${idPrefix}-to-month`}
        label="To"
        value={toMonth}
        choices={choices}
        active={active}
        onChange={m => onChange({ fromMonth: fromMonth > m || !choices.includes(fromMonth) ? m : fromMonth, toMonth: m })}
      />
    </div>
  )
}
