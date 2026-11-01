import { breakRows } from '../../utils/breaks'
import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'
import { fmtDay } from '../../utils/dateFormat'

const COLUMNS = 'grid grid-cols-[50px_50px_minmax(0,1fr)_28px] gap-1.5 items-center'

// fmtDay gives "Sat 20 Mar"; the table drops the month to stay compact.
const dayOnly = date => fmtDay(date).slice(0, -4)

function rowLabel(row) {
  if (row.type === 'public_holiday') return row.holidayName ?? 'Public holiday'
  return row.type === 'leave' ? 'Leave' : 'Weekend'
}

// The break as a table: start | end | holiday (or leave/weekend) | days.
export function BreakDaysTable({ brk }) {
  return (
    <div role="table" aria-label="Days in this break" className="text-xs">
      <div role="row" className={`${COLUMNS} px-1 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide`}>
        <span role="columnheader">Start</span>
        <span role="columnheader">End</span>
        <span role="columnheader">Holiday</span>
        <span role="columnheader" className="text-right">Days</span>
      </div>
      {breakRows(brk).map(row => (
        <div
          key={row.startDate}
          role="row"
          className={`${COLUMNS} px-1 py-1.5 border-t border-slate-100 ${row.type === 'public_holiday' ? 'bg-orange-50' : ''}`}
        >
          <span role="cell" className="font-semibold text-slate-700 truncate">{dayOnly(row.startDate)}</span>
          <span role="cell" className="text-slate-600 truncate">{dayOnly(row.endDate)}</span>
          <span role="cell" className={`flex items-center gap-1.5 min-w-0 ${row.type === 'public_holiday' ? 'font-bold' : 'font-medium'}`}>
            <span className="shrink-0 w-2 h-2 rounded-sm" style={{ backgroundColor: DAY_TYPE_COLOUR[row.type] }} />
            <span className="truncate" title={rowLabel(row)}>{rowLabel(row)}</span>
          </span>
          <span role="cell" className="text-right font-bold">{row.count}</span>
        </div>
      ))}
    </div>
  )
}
