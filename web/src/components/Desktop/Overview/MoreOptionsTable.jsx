import { fmtDay } from '../../../utils/dateFormat'
import { formatMultiplier } from '../../../utils/breaks'

const COLUMNS = 'grid grid-cols-[minmax(0,1.5fr)_1fr_1fr_84px_76px_88px_176px] gap-3 items-center'

// "Sat 20 Mar '27" — the table can span two years, so it keeps a short year.
const dateWithYear = date => `${fmtDay(date)} '${date.slice(2, 4)}`

function totals(breaks) {
  const leave = breaks.reduce((t, b) => t + b.leaveDays, 0)
  const daysOff = breaks.reduce((t, b) => t + b.daysOff, 0)
  return { leave, daysOff, multiplier: leave ? daysOff / leave : 0 }
}

function Row({ option, start, end, leave, daysOff, multiplier, sub, children }) {
  return (
    <div role="row" className={`${COLUMNS} ${sub ? 'py-2 border-t border-slate-100 bg-slate-50' : 'py-3 border-t border-slate-200'}`}>
      <span role="cell" className={sub ? 'pl-3.5 text-slate-600 font-semibold' : 'font-extrabold'}>{option}</span>
      <span role="cell" className="text-slate-700">{start}</span>
      <span role="cell" className="text-slate-700">{end}</span>
      <span role="cell" className={`text-right ${sub ? 'font-medium' : 'font-extrabold'}`}>{leave}</span>
      <span role="cell" className={`text-right ${sub ? 'font-medium' : 'font-extrabold'}`}>{daysOff}</span>
      <span role="cell" className="text-right">
        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[13px] font-extrabold">{formatMultiplier(multiplier)}</span>
      </span>
      <span role="cell" className="flex justify-end gap-1.5">{children}</span>
    </div>
  )
}

/**
 * The other quick picks as one table. Single-break picks get one row each;
 * the year plan gets a total row with its breaks listed underneath.
 *
 * Props:
 *   options  – [{ id, title, breaks }]
 *   isSaved  – (break) => bool
 *   onAdd    – (breaks) => void
 *   onView   – (id) => void
 */
export function MoreOptionsTable({ options, isSaved, onAdd, onView }) {
  return (
    <section aria-label="More options" className="bg-white rounded-[20px] px-5 pt-2 pb-3 shadow-sm overflow-x-auto">
      <div role="table" aria-label="More options" className="min-w-[780px] text-sm">
        <div role="row" className={`${COLUMNS} py-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide`}>
          <span role="columnheader">Option</span>
          <span role="columnheader">Start</span>
          <span role="columnheader">End</span>
          <span role="columnheader" className="text-right">Leave used</span>
          <span role="columnheader" className="text-right">Days off</span>
          <span role="columnheader" className="text-right">Multiplier</span>
          <span role="columnheader" className="sr-only">Actions</span>
        </div>

        {options.map(opt => {
          const isPlan = opt.id === 'year'
          const t = totals(opt.breaks)
          const first = opt.breaks[0]
          const last = opt.breaks[opt.breaks.length - 1]
          const allSaved = opt.breaks.every(isSaved)
          return (
            <div key={opt.id} className={isPlan ? 'bg-slate-50' : ''}>
              <Row
                option={opt.title}
                start={isPlan ? `${opt.breaks.length} breaks` : dateWithYear(first.startDate)}
                end={isPlan ? '' : dateWithYear(last.endDate)}
                leave={t.leave}
                daysOff={t.daysOff}
                multiplier={t.multiplier}
              >
                <button
                  type="button"
                  disabled={allSaved}
                  onClick={() => onAdd(opt.breaks)}
                  className={`h-[34px] px-3 rounded-lg text-[13px] font-bold ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
                >
                  {allSaved ? 'Added ✓' : isPlan ? `Add all ${opt.breaks.length}` : 'Add'}
                </button>
                <button type="button" onClick={() => onView(opt.id)} className="h-[34px] px-2.5 rounded-lg border border-slate-300 text-[13px] font-bold">
                  View →
                </button>
              </Row>
              {isPlan && opt.breaks.map((b, i) => (
                <Row
                  key={b.startDate}
                  sub
                  option={`↳ Break ${i + 1}`}
                  start={dateWithYear(b.startDate)}
                  end={dateWithYear(b.endDate)}
                  leave={b.leaveDays}
                  daysOff={b.daysOff}
                  multiplier={b.multiplier}
                />
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
