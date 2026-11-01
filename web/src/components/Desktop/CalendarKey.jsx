import { useState, useRef, useEffect } from 'react'
import { StatTile } from './StatTile'
import { DAY_TYPE_LEGEND } from '../../utils/dayTypes'

function Row({ marker, children }) {
  return (
    <li className="flex items-center gap-2.5 text-[13px] text-slate-700">
      <span className="w-[30px] shrink-0 flex justify-center">{marker}</span>
      <span>{children}</span>
    </li>
  )
}

/**
 * "ⓘ Key" button for the calendar page's top-right corner; opens a popover
 * explaining the hover card icons, day colours and calendar markers.
 */
export function CalendarKey() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close when the user clicks anywhere outside the popover.
  useEffect(() => {
    if (!open) return
    function handleDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={`h-9 pl-2 pr-3 rounded-full border inline-flex items-center gap-1.5 text-sm font-semibold ${open ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12" y2="8" />
        </svg>
        Key
      </button>

      {open && (
        <div role="dialog" aria-label="Calendar key" className="absolute z-50 right-0 top-11 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3.5">
          <section>
            <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Hover card</h3>
            <div className="flex flex-wrap gap-1.5">
              <StatTile kind="leave" label="leave" />
              <StatTile kind="free" label="free days" />
              <StatTile kind="multiplier" value="×" label="multiplier" />
              <StatTile kind="total" label="total off" />
            </div>
          </section>

          <section>
            <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Days in a break</h3>
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              {DAY_TYPE_LEGEND.map(l => (
                <Row key={l.type} marker={<span className="w-4 h-4 rounded" style={{ backgroundColor: l.colour }} />}>{l.label}</Row>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">On the calendar</h3>
            <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
              <Row marker={<span className="relative w-6 h-6 rounded-full bg-amber-500"><span className="absolute bottom-0.5 left-1/2 -ml-0.5 w-1 h-1 rounded-full bg-slate-900" /></span>}>Public holiday (dot)</Row>
              <Row marker={<span className="w-6 h-6 rounded-full bg-transparent text-slate-500 text-xs font-semibold flex items-center justify-center">4</span>}>No free days (not coloured)</Row>
              <Row marker={<span className="w-6 h-6 rounded-full bg-teal-500 shadow-[0_0_0_3px_#0f172a]" />}>Start of a saved break</Row>
              <Row marker={<span className="w-[26px] h-1 rounded-sm bg-green-600" />}>School holiday (when that filter is on)</Row>
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
