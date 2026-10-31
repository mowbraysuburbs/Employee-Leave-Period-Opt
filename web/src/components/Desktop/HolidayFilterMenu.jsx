import { useState, useRef, useEffect } from 'react'

function label(selected) {
  if (selected.length === 0) return 'All'
  if (selected.length === 1) return selected[0]
  return `${selected.length} selected`
}

/**
 * Props:
 *   options  – [{ name, when }] each public holiday in the date period, once
 *   selected – string[] of holiday names
 *   onChange – (string[]) => void
 */
export function HolidayFilterMenu({ options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close when the user clicks anywhere outside the menu.
  useEffect(() => {
    if (!open) return
    function handleDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [open])

  function toggle(name) {
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])
  }

  const active = selected.length > 0

  return (
    <div ref={wrapperRef} className="relative" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={[
          'h-11 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-semibold border',
          active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300 shadow-sm',
        ].join(' ')}
      >
        Public holidays: <strong>{label(selected)}</strong>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <div className="absolute z-40 top-13 left-0 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-xl p-2">
          <div className="px-2.5 pt-2 pb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Show breaks that include</div>
          <div className="max-h-[300px] overflow-y-auto">
            {options.map(o => (
              <label key={o.name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.includes(o.name)}
                  onChange={() => toggle(o.name)}
                  className="w-4 h-4 accent-sky-700"
                />
                <span className="flex-1">{o.name}</span>
                <span className="text-xs text-slate-500">{o.when}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between gap-2 px-1 pt-2 mt-1 border-t border-slate-100">
            <button type="button" onClick={() => onChange([])} className="h-9 px-3 rounded-lg text-sky-700 text-sm font-bold">Clear all</button>
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-bold">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
