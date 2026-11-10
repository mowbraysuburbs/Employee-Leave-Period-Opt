import { useEffect, useRef, useState } from 'react'
import { PlanIcon } from './PlanIcon'
import { PeriodMonths } from './PeriodMonths'
import { PERIOD_SHORT } from './periodThemes'

/**
 * Step 1 folded into a slim strip, like the Calendar's collapsed rail: » to
 * open it again, then the periods as the phone's icons (icon + short name),
 * the picked one outlined. Custom opens a small From / To pop-out beside it.
 *
 * Props: the same as PeriodList (periods, period, months, onChangeMonths,
 *   selectedId, onSelect) plus onExpand
 */
export function PeriodStrip({ periods, period, months, onChangeMonths, selectedId, onSelect, onExpand }) {
  const [customOpen, setCustomOpen] = useState(false)
  const wrapRef = useRef(null)
  // Close the Custom pop-out on a click outside it or Escape.
  useEffect(() => {
    if (!customOpen) return
    const close = e => { if (!wrapRef.current?.contains(e.target)) setCustomOpen(false) }
    const esc = e => { if (e.key === 'Escape') setCustomOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [customOpen])

  const tiles = [{ id: 'custom', kind: 'custom', title: 'Custom dates' }, ...periods]
  return (
    <div ref={wrapRef} className="relative shrink-0 h-full">
      <aside aria-label="Leave periods (folded)" className="w-[74px] h-full overflow-y-auto flex flex-col items-center gap-1.5 py-2 bg-white rounded-2xl shadow-sm">
        <button type="button" onClick={onExpand} aria-label="Open the leave periods" title="Open the leave periods" className="shrink-0 w-10 h-9 rounded-[10px] bg-slate-900 text-white text-[15px] font-bold">»</button>
        <span aria-hidden="true" className="shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-extrabold flex items-center justify-center">1</span>
        <span aria-hidden="true" className="shrink-0 w-8 h-px bg-slate-200 my-0.5" />
        <nav data-tour="period" aria-label="Leave periods" className="flex flex-col items-center gap-1">
          {tiles.map(p => {
            const on = p.id === selectedId
            return (
              <button
                key={p.id}
                type="button"
                aria-label={p.title}
                aria-pressed={on}
                aria-expanded={p.id === 'custom' ? customOpen : undefined}
                title={p.title}
                onClick={() => (p.id === 'custom' ? setCustomOpen(o => !o) : onSelect(p.id))}
                className={`shrink-0 w-[62px] pt-1 pb-0.5 rounded-xl border-2 flex flex-col items-center gap-px ${on ? 'border-slate-900 bg-slate-50' : 'border-transparent text-slate-700 hover:bg-slate-50'}`}
              >
                <PlanIcon kind={p.kind} size={28} />
                <span className="text-[9.5px] font-bold whitespace-nowrap">{PERIOD_SHORT[p.kind] ?? p.title}</span>
              </button>
            )
          })}
        </nav>
      </aside>
      {customOpen && (
        <div role="dialog" aria-label="Custom dates" className="absolute z-30 left-[82px] top-24 w-[260px] p-3 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col gap-2">
          <b className="text-[13px]">Custom dates</b>
          <PeriodMonths idPrefix="strip" period={period} choices={months} active={selectedId === 'custom'} onChange={range => { onChangeMonths(range); onSelect('custom') }} />
          {selectedId !== 'custom' && (
            <button type="button" onClick={() => { onSelect('custom'); setCustomOpen(false) }} className="h-8 rounded-lg bg-slate-900 text-white text-xs font-bold">Use these months</button>
          )}
        </div>
      )}
    </div>
  )
}
