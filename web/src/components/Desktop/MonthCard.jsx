import { TODAY } from '../../hooks/useLeavePlanner'

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
 *   large        – bigger day cells for touch screens (the mobile calendar)
 *   compact      – small cells so two months fit side by side on a phone
 *   tour         – data-tour name, so the guided tour can spotlight this month
 */
export function MonthCard({ year, month, days, popoverFor, onDayClick, onDayHover, large = false, compact = false, tour }) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay()

  return (
    <div data-tour={tour} className={`bg-white shadow-sm ${compact ? 'rounded-xl px-1.5 py-2' : 'rounded-2xl p-3.5'}`}>
      <h2 className={`m-0 font-bold ${compact ? 'mb-1 ml-1 text-xs' : 'mb-2 text-[15px]'}`}>{MONTH_NAMES[month - 1]} {year}</h2>
      {/* No column gap, so a hovered break's days touch and read as one band;
          normal days get a little padding instead to stay apart. */}
      <div className={`grid grid-cols-7 text-center ${compact ? 'gap-y-0.5' : 'gap-y-[3px]'}`}>
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className={`font-bold text-slate-500 pb-0.5 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>{w}</div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
        {days.map(d => (
          <div key={d.date} className={`relative ${d.inBand ? '' : compact ? 'px-px' : 'px-[1.5px]'}`}>
            <button
              type="button"
              disabled={d.disabled}
              aria-label={d.date === TODAY ? `Today, ${d.ariaLabel}` : d.ariaLabel}
              aria-current={d.date === TODAY ? 'date' : undefined}
              onClick={() => onDayClick(d.date)}
              onMouseEnter={() => onDayHover(d.date)}
              onMouseLeave={() => onDayHover(null)}
              onFocus={() => onDayHover(d.date)}
              onBlur={() => onDayHover(null)}
              data-date={d.date}
              className={[
                'relative w-full',
                compact ? 'h-[22px] text-[10px]' : large ? 'h-10 text-sm' : 'h-8 text-xs',
                d.shape ?? 'rounded-full',
                d.isHoliday ? 'font-extrabold' : 'font-semibold',
                d.disabled ? 'cursor-default' : 'cursor-pointer',
                // Today: a blue outline just outside the cell, separate from the box-shadow rings.
                d.date === TODAY ? `outline-2 outline-sky-600 z-10 ${compact ? 'outline-offset-1' : 'outline-offset-2'}` : '',
              ].join(' ')}
              style={{ backgroundColor: d.look.bg, color: d.look.fg, boxShadow: d.ring ?? undefined }}
            >
              {d.dayNumber}
              {d.isHoliday && (
                <span className={`absolute left-1/2 rounded-full ${compact ? 'bottom-px -ml-[1.5px] w-[3px] h-[3px]' : 'bottom-[3px] -ml-0.5 w-1 h-1'}`} style={{ backgroundColor: d.look.fg }} />
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
