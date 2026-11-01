const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Props:
 *   year, month  – month is 1-based
 *   days         – [{ date, dayNumber, look: { bg, fg }, ring, isHoliday, disabled, ariaLabel,
 *                     inBand, shape, school }]  inBand/shape are set while the day is in the hovered or selected break;
 *                     school is { roundLeft, roundRight } on school-holiday days while that filter is on
 *   popoverFor   – (date) => node | null; the hover card to show on a day
 *   onDayClick, onDayHover
 */
export function MonthCard({ year, month, days, popoverFor, onDayClick, onDayHover }) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay()

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm">
      <h2 className="m-0 mb-2 text-[15px] font-bold">{MONTH_NAMES[month - 1]} {year}</h2>
      {/* No column gap, so a hovered break's days touch and read as one band;
          normal days get a little padding instead to stay apart. */}
      <div className="grid grid-cols-7 gap-y-[3px] text-center">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-500 pb-0.5">{w}</div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
        {days.map(d => (
          <div key={d.date} className={`relative ${d.inBand ? '' : 'px-[1.5px]'}`}>
            <button
              type="button"
              disabled={d.disabled}
              aria-label={d.ariaLabel}
              onClick={() => onDayClick(d.date)}
              onMouseEnter={() => onDayHover(d.date)}
              onMouseLeave={() => onDayHover(null)}
              onFocus={() => onDayHover(d.date)}
              onBlur={() => onDayHover(null)}
              className={[
                'relative w-full h-8 text-xs',
                d.shape ?? 'rounded-full',
                d.isHoliday ? 'font-extrabold' : 'font-semibold',
                d.disabled ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
              style={{ backgroundColor: d.look.bg, color: d.look.fg, boxShadow: d.ring ?? undefined }}
            >
              {d.dayNumber}
              {d.isHoliday && (
                <span className="absolute bottom-[3px] left-1/2 -ml-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: d.look.fg }} />
              )}
            </button>
            {d.school && (
              // Green bar under school-holiday days; with no column gap the bars
              // join into one line, rounded where a holiday or week row ends.
              <span
                aria-hidden="true"
                className={[
                  'absolute left-0 right-0 -bottom-[3px] h-[3px] bg-green-600',
                  d.school.roundLeft ? 'rounded-l-sm' : '',
                  d.school.roundRight ? 'rounded-r-sm' : '',
                ].join(' ')}
              />
            )}
            {popoverFor(d.date)}
          </div>
        ))}
      </div>
    </div>
  )
}
