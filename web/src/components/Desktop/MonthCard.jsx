import { HoverCard } from './HoverCard'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Props:
 *   year, month  – month is 1-based
 *   days         – [{ date, dayNumber, look: { bg, fg }, ring, isHoliday, disabled, ariaLabel }]
 *   hoveredDate, hoverBreak
 *   onDayClick, onDayHover
 */
export function MonthCard({
  year,
  month,
  days,
  hoveredDate,
  hoverBreak,
  onDayClick,
  onDayHover,
}) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay()

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm">
      <h2 className="m-0 mb-2 text-[15px] font-bold">{MONTH_NAMES[month - 1]} {year}</h2>
      <div className="grid grid-cols-7 gap-[3px] text-center">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-500 pb-0.5">{w}</div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
        {days.map(d => (
          <div key={d.date} className="relative">
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
                'relative w-full h-8 rounded-full text-xs',
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
            {hoveredDate === d.date && hoverBreak && <HoverCard brk={hoverBreak} />}
          </div>
        ))}
      </div>
    </div>
  )
}
