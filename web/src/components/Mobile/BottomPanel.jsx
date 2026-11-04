import { useEffect, useRef, useState } from 'react'
import { MAX_LEAVE } from '../../utils/planner'

const HOLD_MS = 500

/**
 * "7 left": its light-blue fill shows how much of your limit is already in
 * your Summary. Long-press it to snap the leave days to what's left (a green
 * outline draws while you hold; snapped = green outline and text). Enter does
 * the same for keyboards and screen readers; a quick tap shows a hint.
 */
function DaysLeft({ left, usedShare, snapped, onSnap }) {
  const [holding, setHolding] = useState(false)
  const [hint, setHint] = useState(false)
  const timer = useRef(null)
  const fired = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!hint) return
    const id = setTimeout(() => setHint(false), 2200)
    return () => clearTimeout(id)
  }, [hint])

  function start(e) {
    e.preventDefault()
    fired.current = false
    setHolding(true)
    timer.current = setTimeout(() => {
      fired.current = true
      setHolding(false)
      navigator.vibrate?.(15)
      onSnap()
    }, HOLD_MS)
  }
  function end() {
    clearTimeout(timer.current)
    if (holding && !fired.current && !snapped) setHint(true)
    setHolding(false)
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        data-tour="snap"
        aria-pressed={snapped}
        aria-label={snapped ? `Using all ${left} leave days left` : `${left} leave days left. Press and hold to use all of them`}
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        onContextMenu={e => e.preventDefault()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSnap() } }}
        className={`relative w-[80px] h-[30px] rounded-full overflow-hidden select-none touch-none border-[1.5px] text-xs font-extrabold ${snapped ? 'border-green-600 text-green-800' : 'border-slate-300 text-slate-900'}`}
        style={{ WebkitTouchCallout: 'none' }}
      >
        {/* Progress: the share of your limit already in your Summary. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-blue-100" style={{ width: `${usedShare * 100}%` }} />
        {/* While holding, a green outline draws around the label. */}
        <svg aria-hidden="true" className={`absolute inset-0 w-full h-full ${holding ? '' : 'invisible'}`} viewBox="0 0 80 30" preserveAspectRatio="none">
          <rect
            x="0.75" y="0.75" width="78.5" height="28.5" rx="14.25"
            fill="none" stroke="#16a34a" strokeWidth="2" pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={holding ? 0 : 100}
            style={{ transition: holding ? `stroke-dashoffset ${HOLD_MS}ms linear` : 'none' }}
          />
        </svg>
        <span className="relative">{left} left</span>
      </button>
      {hint && (
        <span role="status" className="absolute bottom-[38px] left-0 z-30 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11.5px] font-bold shadow-lg">
          Hold to use all {left}
        </span>
      )}
    </span>
  )
}

/**
 * The leave days as a swipe strip: three numbers, the middle one (your leave
 * days) bigger, the ones beside it faded. Swipe sideways or tap a faded number;
 * arrow keys work too (it's a slider for screen readers).
 */
function LeaveStrip({ value, max, snapped, onChange }) {
  const startX = useRef(null)
  const startValue = useRef(value)
  const moved = useRef(false)
  // The faded number under the finger, so a tap (no swipe) can pick it.
  const tapped = useRef(null)
  const STEP_PX = 26

  function down(e) {
    startX.current = e.clientX
    startValue.current = value
    moved.current = false
    tapped.current = e.target.closest('[data-n]')?.dataset.n ?? null
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  function move(e) {
    if (startX.current === null) return
    if (Math.abs(startX.current - e.clientX) > 6) moved.current = true
    const steps = Math.round((startX.current - e.clientX) / STEP_PX)
    const next = Math.max(1, Math.min(max, startValue.current + steps))
    if (next !== value) onChange(next)
  }
  function up() {
    if (startX.current !== null && !moved.current && tapped.current) onChange(Number(tapped.current))
    startX.current = null
  }

  const side = n => (n < 1 || n > max
    ? <span className="w-7" aria-hidden="true" />
    : (
      <span data-n={n} aria-hidden="true" className="w-7 text-center text-[15px] font-extrabold text-slate-400 opacity-60 cursor-pointer">
        {n}
      </span>
    ))

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Leave days"
      aria-valuemin={1}
      aria-valuemax={max}
      aria-valuenow={value}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + 1)) }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)) }
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="flex items-center gap-1 touch-pan-y select-none rounded-xl focus:outline-2 focus:outline-sky-600"
    >
      <span aria-hidden="true" className="text-sm text-slate-300">‹</span>
      {side(value - 1)}
      <span className={`w-11 h-10 rounded-xl flex items-center justify-center text-[22px] font-extrabold text-white ${snapped ? 'bg-green-600' : 'bg-sky-700'}`}>{value}</span>
      {side(value + 1)}
      <span aria-hidden="true" className="text-sm text-slate-300">›</span>
    </div>
  )
}

/**
 * The phone calendar's controls, two rows within thumb reach.
 * Row 1: Total days ⇆ Multiplier and the colour chips (tap a chip to filter).
 * Row 2: the Leave pill ("N left" + the swipe strip + your limit) and Filters.
 *
 * Props: c – the calendar controls (useLeavePlanner().controls)
 *        filterable – the days-off chips can filter (Total days, not Selected only)
 *        activeCount, onOpenFilters – the Filters button
 */
export function BottomPanel({ c, filterable, activeCount = 0, onOpenFilters }) {
  const [limitOpen, setLimitOpen] = useState(false)
  const limitRef = useRef(null)
  useEffect(() => {
    if (!limitOpen) return
    const close = e => { if (!limitRef.current?.contains(e.target)) setLimitOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [limitOpen])

  const snapped = c.leaveMode === 'snap'
  const multiplier = c.colourBy === 'multiplier'
  const filtering = filterable && c.daysOffFilter.length > 0
  const usedShare = c.leaveLimit ? Math.min(1, c.leaveInSummary / c.leaveLimit) : 0
  const chip = 'shrink-0 min-w-[30px] h-[30px] px-1.5 rounded-full inline-flex items-center justify-center text-xs font-bold text-slate-900'

  return (
    <div className="shrink-0 px-2.5 pt-2 pb-2.5 bg-white border-t border-slate-200 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] flex flex-col gap-2 [&>*]:w-full [&>*]:max-w-[520px] [&>*]:mx-auto">
      {/* py-1 leaves room for the ring on a picked chip inside the scrolling row. */}
      <div data-tour="colours" className="flex items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
        <button
          type="button"
          aria-label={`Colouring by ${multiplier ? 'multiplier' : 'total days off'}; tap to switch`}
          onClick={() => c.onColourByChange(multiplier ? 'daysOff' : 'multiplier')}
          className="shrink-0 h-[30px] pl-2.5 pr-2 rounded-full border border-slate-300 bg-white text-[11.5px] font-bold text-slate-700 inline-flex items-center gap-1"
        >
          {multiplier ? 'Multiplier' : 'Total days'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
          </svg>
        </button>
        {c.legend.map(l => {
          if (!filterable) return <span key={l.label} className={chip} style={{ backgroundColor: l.colour }}>{l.label}</span>
          const on = c.daysOffFilter.includes(l.value)
          return (
            <button
              key={l.label}
              type="button"
              aria-pressed={on}
              aria-label={`${on ? 'Hide' : 'Show only'} days with ${l.label} days off`}
              onClick={() => c.onToggleDaysOff(l.value)}
              className={`${chip} ${on ? 'ring-2 ring-slate-900 ring-offset-1' : filtering ? 'opacity-30' : ''}`}
              style={{ backgroundColor: l.colour }}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div data-tour="leave" className="flex-1 min-w-0 h-[66px] rounded-[20px] bg-slate-100 flex items-center gap-1.5 pl-3 pr-2">
          <div className="shrink-0 flex flex-col gap-[3px]">
            <span className="text-[13px] font-bold">Leave</span>
            <DaysLeft left={c.leaveLeft} usedShare={usedShare} snapped={snapped} onSnap={() => c.onLeaveModeChange(snapped ? 'manual' : 'snap')} />
          </div>
          <div className="flex-1 min-w-0 flex justify-center">
            <LeaveStrip value={c.leaveDays} max={c.leaveLimit} snapped={snapped} onChange={c.onLeaveDaysChange} />
          </div>
          <span aria-hidden="true" className="shrink-0 w-0.5 h-7 bg-slate-300" />
          <div ref={limitRef} className="relative shrink-0">
            <button
              type="button"
              aria-label={`Leave limit: ${c.leaveLimit}. Change`}
              aria-expanded={limitOpen}
              onClick={() => setLimitOpen(o => !o)}
              className={`h-10 min-w-[52px] px-2 rounded-xl border-[1.5px] flex flex-col items-center justify-center leading-none ${limitOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}
            >
              <span className="text-[19px] font-extrabold">{c.leaveLimit}▾</span>
              <span className="text-[8.5px] font-bold opacity-70 mt-px">LIMIT</span>
            </button>
            {limitOpen && (
              <div role="dialog" aria-label="Your leave limit" className="absolute bottom-[50px] right-[-8px] z-30 w-[236px] p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200">
                <b className="text-[13px]">Your leave limit</b>
                <p className="m-0 mb-2 text-[11px] text-slate-500">The most leave days you plan with. {c.leaveInSummary} in your Summary, so {c.leaveLeft} left.</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={n === c.leaveLimit}
                      onClick={() => { c.onLeaveLimitChange(n); setLimitOpen(false) }}
                      className={`h-9 rounded-lg font-extrabold ${n === c.leaveLimit ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label={activeCount ? `Filters, ${activeCount} on` : 'Filters'}
          onClick={onOpenFilters}
          className={`relative shrink-0 w-[50px] h-[50px] rounded-full border flex items-center justify-center ${activeCount ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}
        >
          {activeCount > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-sky-500 text-white border-2 border-white text-[11px] font-extrabold flex items-center justify-center">{activeCount}</span>
          )}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
