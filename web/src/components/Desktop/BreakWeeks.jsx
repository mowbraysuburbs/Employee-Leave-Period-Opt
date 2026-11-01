import { breakWeeks } from '../../utils/breaks'
import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function monthLabel(dateStr) {
  return `${SHORT_MONTH[Number(dateStr.slice(5, 7)) - 1]} ${dateStr.slice(0, 4)}`
}

/**
 * Mini calendar of only the week rows a break touches. A break that crosses
 * into a new month runs straight on in the same strip; the 1st is marked
 * with the month name and a divider line.
 */
export function BreakWeeks({ brk }) {
  const cells = breakWeeks(brk)
  const title = brk.startDate.slice(0, 7) === brk.endDate.slice(0, 7)
    ? monthLabel(brk.startDate)
    : `${monthLabel(brk.startDate)} – ${monthLabel(brk.endDate)}`

  return (
    <section aria-label="Break calendar" className="border border-slate-200 rounded-2xl p-3">
      <div className="text-sm font-bold mb-2">{title}</div>
      <div className="grid grid-cols-7 gap-[3px] text-center">
        {WEEKDAY_HEADERS.map((w, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-500">{w}</div>
        ))}
        {cells.map(({ date, type }) => {
          // Only mark a month change the break actually runs into.
          const isFirst = date.endsWith('-01') && date > brk.startDate && date <= brk.endDate
          return (
            <div
              key={date}
              className={`h-[30px] flex flex-col items-center justify-center rounded-md text-xs leading-none ${type ? 'font-bold' : 'text-slate-300'}`}
              style={{
                backgroundColor: type ? DAY_TYPE_COLOUR[type] : undefined,
                color: type ? (type === 'weekend' ? '#ffffff' : '#0f172a') : undefined,
                boxShadow: isFirst ? 'inset 2px 0 0 #0f172a' : undefined,
              }}
            >
              <span>{Number(date.slice(8))}</span>
              {isFirst && <span className="text-[9px] font-bold mt-px">{SHORT_MONTH[Number(date.slice(5, 7)) - 1]}</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
