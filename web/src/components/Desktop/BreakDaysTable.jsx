import { breakRows } from '../../utils/breaks'
import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'
import { fmtDay } from '../../utils/dateFormat'

// fmtDay gives "Sat 20 Mar"; the table drops the month to stay compact.
const dayOnly = date => fmtDay(date).slice(0, -4)

function rowLabel(row) {
  if (row.type === 'public_holiday') return row.holidayName ?? 'Public holiday'
  return row.type === 'leave' ? 'Leave' : 'Weekend'
}

// The break as a date-first table: date | kind of day | how many days.
export function BreakDaysTable({ brk }) {
  return (
    <div role="table" aria-label="Days in this break" className="text-sm">
      {breakRows(brk).map(row => (
        <div
          key={row.startDate}
          role="row"
          className={`grid grid-cols-[118px_minmax(0,1fr)_auto] items-center gap-2.5 px-1 py-[7px] border-t border-slate-100 ${row.type === 'public_holiday' ? 'bg-orange-50' : ''}`}
        >
          <span role="cell" className="font-semibold text-slate-600 whitespace-nowrap">
            {row.startDate === row.endDate ? dayOnly(row.startDate) : `${dayOnly(row.startDate)} – ${dayOnly(row.endDate)}`}
          </span>
          <span role="cell" className={`flex items-center gap-2 ${row.type === 'public_holiday' ? 'font-bold' : 'font-medium'}`}>
            <span className="shrink-0 w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DAY_TYPE_COLOUR[row.type] }} />
            {rowLabel(row)}
          </span>
          <span role="cell" className="text-xs text-slate-500 whitespace-nowrap">
            {row.count} {row.count === 1 ? 'day' : 'days'}
          </span>
        </div>
      ))}
    </div>
  )
}
