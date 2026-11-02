import { useState } from 'react'
import { googleCalendarUrl, buildIcs, downloadIcs } from '../../utils/calendarExport'
import { toCalendarEvent } from '../../utils/breaks'
import { fmtDayRange } from '../../utils/dateFormat'

const option = 'h-10 rounded-xl bg-slate-900 text-white text-sm font-bold inline-flex items-center justify-center disabled:opacity-40'

/**
 * "Add to calendar" for every saved break: Apple / iPhone downloads one .ics
 * with them all (also opens in Outlook). A Google link can only hold one event,
 * so with several breaks Google lists one link per break.
 *
 * Props:
 *   breaks – saved breaks, newest first
 */
export function CalendarExport({ breaks }) {
  const [googleOpen, setGoogleOpen] = useState(false)
  const none = breaks.length === 0
  const single = breaks.length === 1 ? googleCalendarUrl(toCalendarEvent(breaks[0])) : null

  return (
    <div data-tour="export" className="flex flex-col gap-1.5">
      <span className="text-[13px] font-bold">Add {breaks.length > 1 ? 'all ' : ''}to calendar</span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={none}
          onClick={() => downloadIcs(buildIcs(breaks.map(toCalendarEvent)), 'my-leave-breaks.ics')}
          className={option}
        >
          Apple / iPhone
        </button>
        {single ? (
          <a href={single} target="_blank" rel="noopener noreferrer" className={option}>Google</a>
        ) : (
          <button type="button" disabled={none} aria-expanded={googleOpen} onClick={() => setGoogleOpen(o => !o)} className={option}>
            Google {googleOpen ? '▴' : '▾'}
          </button>
        )}
      </div>
      <span className="text-[11px] text-slate-500">Apple / iPhone also works for Outlook.</span>

      {googleOpen && !single && !none && (
        <ul className="m-0 p-0 list-none rounded-xl border border-slate-200 divide-y divide-slate-100">
          <li className="px-3 py-1.5 text-[11px] text-slate-500">Google adds one break at a time:</li>
          {breaks.map(b => (
            <li key={b.startDate} className="flex items-center justify-between gap-2 px-3 py-1.5 text-[13px]">
              <span className="font-semibold">{fmtDayRange(b.startDate, b.endDate)}</span>
              <a href={googleCalendarUrl(toCalendarEvent(b))} target="_blank" rel="noopener noreferrer" className="shrink-0 font-bold text-sky-700">Add ↗</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
