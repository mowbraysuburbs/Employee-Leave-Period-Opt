import { TODAY } from '../../hooks/useLeavePlanner'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
// Saved days: near-black boxes with lighter numbers (palette variables, so dark mode flips them).
const SAVED_LOOK = { bg: 'var(--color-slate-900, #0f172a)', fg: 'var(--color-slate-300, #cbd5e1)' }

/**
 * Props:
 *   year, month  – month is 1-based
 *   days         – [{ date, dayNumber, look: { bg, fg }, saved, isHoliday, disabled, ariaLabel,
 *                     band, school }]  band is { roundLeft, roundRight, selected } while the day is in the hovered or
 *                     selected break (a grey pill); saved is { roundLeft, roundRight, start } on saved days (dark joined boxes, which win);
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
      {/* No column gap, so a break's grey pill runs unbroken behind its days;
          the circles get a little padding instead to stay apart. */}
      <div className={`grid grid-cols-7 text-center ${compact ? 'gap-y-0.5' : 'gap-y-[3px]'}`}>
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className={`font-bold text-slate-500 pb-0.5 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>{w}</div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
        {days.map(d => {
          // Saved days: dark joined boxes with lighter numbers; everything else stays a circle.
          const look = d.saved ? SAVED_LOOK : d.look
          const shape = !d.saved ? 'rounded-full'
            : d.saved.roundLeft && d.saved.roundRight ? 'rounded-md'
            : d.saved.roundLeft ? 'rounded-l-md' : d.saved.roundRight ? 'rounded-r-md' : 'rounded-none'
          const startDot = d.saved?.start ? 'bg-white' : d.band?.selected && d.band.start ? 'bg-slate-500' : null
          return (
          <div key={d.date} className={`relative ${d.saved ? '' : compact ? 'px-px' : 'px-[1.5px]'}`}>
            {!d.saved && d.band && (
              <span
                aria-hidden="true"
                className={[
                  'absolute inset-y-0 left-0 right-0',
                  d.band.selected ? 'bg-slate-300' : 'bg-slate-200',
                  d.band.roundLeft ? 'rounded-l-full' : '',
                  d.band.roundRight ? 'rounded-r-full' : '',
                ].join(' ')}
              />
            )}
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
                shape,
                d.isHoliday ? 'font-extrabold' : 'font-semibold',
                d.disabled ? 'cursor-default' : 'cursor-pointer',
                // Today: a blue outline just outside the cell.
                d.date === TODAY ? `outline-2 outline-sky-600 z-10 ${compact ? 'outline-offset-1' : 'outline-offset-2'}` : '',
              ].join(' ')}
              style={{ backgroundColor: look.bg, color: look.fg }}
            >
              {startDot && (
                // Where the break starts: a dot in the top-left corner.
                <span aria-hidden="true" className={`absolute rounded-full ${startDot} ${compact ? 'top-0 left-0 w-1.5 h-1.5' : 'top-0.5 left-0.5 w-2 h-2'}`} />
              )}
              {d.dayNumber}
              {d.isHoliday && (
                <span className={`absolute left-1/2 rounded-full ${compact ? 'bottom-px -ml-[1.5px] w-[3px] h-[3px]' : 'bottom-[3px] -ml-0.5 w-1 h-1'}`} style={{ backgroundColor: look.fg }} />
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
          )
        })}
      </div>
    </div>
  )
}
