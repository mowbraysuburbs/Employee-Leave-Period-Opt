import { useState, useRef, useEffect } from 'react'
import { KeyContent } from './KeyContent'

/**
 * "ⓘ Key" button for the calendar page's top-right corner; opens a popover
 * explaining the hover card (with a worked example), day colours and
 * calendar markers.
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
          <KeyContent />
        </div>
      )}
    </div>
  )
}
