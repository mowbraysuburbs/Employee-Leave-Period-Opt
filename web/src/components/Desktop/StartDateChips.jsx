const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * A row of day icons, one per neighbouring start date that gives the same
 * result, so people can move the break with one click. Each shows the weekday
 * over the date; where the dates cross into a new month, that icon shows the
 * month instead of the weekday (e.g. Tue 31 · Apr 1).
 *
 * Props:
 *   options  – findEqualStarts() result (includes the current break)
 *   current  – start date of the break shown in Details
 *   onPick   – (startDate) => void
 */
export function StartDateChips({ options, current, onPick }) {
  if (!options || options.length < 2) return null

  return (
    <section aria-label="Equal start dates" className="flex flex-col gap-1.5">
      <div>
        <div className="text-[13px] font-bold">Start on</div>
        <p className="m-0 text-xs text-slate-600">Any of these neighbouring dates gives the same {options[0].daysOff} days off.</p>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {options.map((o, i) => {
          const d = new Date(o.startDate + 'T00:00:00')
          const newMonth = i > 0 && o.startDate.slice(0, 7) !== options[i - 1].startDate.slice(0, 7)
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
                'shrink-0 w-10 py-1 rounded-xl border-2 flex flex-col items-center',
                selected ? 'bg-sky-700 border-sky-700 text-white' : 'bg-white border-slate-200 text-slate-900 hover:border-sky-600',
              ].join(' ')}
            >
              <span className="text-[10px] font-bold">{newMonth ? MONTHS[d.getMonth()] : WEEKDAYS[d.getDay()]}</span>
              <span className="text-[15px] font-extrabold leading-tight">{d.getDate()}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
