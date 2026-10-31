import { googleCalendarUrl, buildIcs, downloadIcs } from '../../utils/calendarExport'
import { toCalendarEvent } from '../../utils/breaks'

const promptButton = 'h-8 px-2.5 rounded-lg border border-emerald-200 bg-white text-emerald-800 text-[13px] font-bold'

// Shown right after a break is added: offers to put just that break in a calendar.
export function AddedPrompt({ brk, onDismiss }) {
  const event = toCalendarEvent(brk)

  return (
    <div role="status" className="flex items-center flex-wrap gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
      <span className="flex-auto text-sm font-bold text-emerald-800">Added ✓ Add to calendar?</span>
      <button type="button" className={promptButton} onClick={() => downloadIcs(buildIcs([event]), `leave-${brk.startDate}.ics`)}>
        Apple / Outlook
      </button>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={`${promptButton} inline-flex items-center`}>
        Google
      </a>
      <button type="button" aria-label="Dismiss" onClick={onDismiss} className="w-8 h-8 rounded-lg text-emerald-800 text-sm font-semibold">
        ✕
      </button>
    </div>
  )
}
