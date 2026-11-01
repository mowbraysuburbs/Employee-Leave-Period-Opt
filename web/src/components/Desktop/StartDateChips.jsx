const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * A row of day icons, one per start date that gives the same result, so
 * people can move the break with one click. Weekday on top, date below.
 *
 * Props:
 *   options  – findEqualStarts() result (includes the current break)
 *   current  – start date of the break shown in Details
 *   onPick   – (startDate) => void
 */
export function StartDateChips({ options, current, onPick }) {
  if (!options || options.length < 2) return null

  return (
    <section aria-label="Equal start dates" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-bold">Start on</span>
        <span className="text-xs text-slate-600">{options.length} dates give {options[0].daysOff} days off</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {options.map(o => {
          const d = new Date(o.startDate + 'T00:00:00')
          const label = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
          const selected = o.startDate === current
          return (
            <button
              key={o.startDate}
              type="button"
              aria-pressed={selected}
              aria-label={`Start on ${label}${selected ? ', selected' : ''}`}
              onClick={() => onPick(o.startDate)}
              className={[
                'shrink-0 w-[46px] py-1.5 rounded-xl border-2 flex flex-col items-center gap-px',
                selected ? 'bg-sky-700 border-sky-700 text-white' : 'bg-white border-slate-200 text-slate-900 hover:border-sky-600',
              ].join(' ')}
            >
              <span className="text-[11px] font-bold">{WEEKDAYS[d.getDay()]}</span>
              <span className="text-[17px] font-extrabold leading-tight">{d.getDate()}</span>
              <span className="text-[10px] font-semibold opacity-75">{MONTHS[d.getMonth()]}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
