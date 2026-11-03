import { useEffect, useRef, useState } from 'react'
import { MAX_LEAVE } from '../../utils/planner'

// One labelled button in the panel's bottom row: a value with a small label under it.
function Tile({ value, label, tone = 'plain', onClick, ariaLabel, badge, pressed, tour }) {
  const tones = {
    plain: 'bg-white border-slate-300 text-slate-900',
    dark: 'bg-slate-900 border-slate-900 text-white',
    leftLight: 'bg-green-50 border-green-200 text-green-800',
    leftOn: 'bg-green-600 border-green-600 text-white',
    empty: 'bg-amber-50 border-amber-200 text-amber-800',
  }
  return (
    <button
      type="button"
      data-tour={tour}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={`relative flex-1 min-w-0 h-[52px] rounded-[13px] border-[1.5px] flex flex-col items-center justify-center gap-px ${tones[tone]}`}
    >
      <span className="text-base font-extrabold leading-tight whitespace-nowrap">{value}</span>
      <span className={`text-[9.5px] font-bold whitespace-nowrap ${tone === 'plain' ? 'text-slate-500' : 'opacity-80'}`}>{label}</span>
      {badge > 0 && (
        <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] font-extrabold leading-[14px]">{badge}</span>
      )}
    </button>
  )
}

/**
 * The phone calendar's controls, always two rows within thumb reach.
 * Row 1 shows either the leave-day blocks or the colour chips (tap a chip to
 * filter). Row 2 is five same-size buttons: 📍 days left (tap to snap),
 * Leave days, Limit (opens 1–10), Days off ⇆ Multiplier, and Filters.
 *
 * Props: c – the calendar controls (useLeavePlanner().controls)
 *        filterable – the days-off chips can filter (Total days, not Selected only)
 *        activeCount, onOpenFilters – the Filters button
 */
export function BottomPanel({ c, filterable, activeCount = 0, onOpenFilters }) {
  // Which row 1 shows: the leave blocks or the colour chips.
  const [view, setView] = useState('leave')
  const [limitOpen, setLimitOpen] = useState(false)
  const limitRef = useRef(null)
  useEffect(() => {
    if (!limitOpen) return
    const close = e => { if (!limitRef.current?.contains(e.target)) setLimitOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [limitOpen])

  const snap = c.leaveMode === 'snap'
  const multiplier = c.colourBy === 'multiplier'
  const filtering = filterable && c.daysOffFilter.length > 0

  function tapColours() {
    // First tap shows the chips; once they're showing, each tap switches Days off ⇆ Multiplier.
    if (view !== 'colours') setView('colours')
    else c.onColourByChange(multiplier ? 'daysOff' : 'multiplier')
  }

  const chip = 'shrink-0 min-w-[34px] h-[34px] px-1.5 rounded-full inline-flex items-center justify-center text-xs font-bold text-slate-900'

  return (
    <div className="relative shrink-0 px-2.5 pt-2 pb-2 bg-white border-t border-slate-200 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] flex flex-col gap-2 [&>*]:w-full [&>*]:max-w-[520px] [&>*]:mx-auto">
      {view === 'leave' ? (
        <div data-tour="leave" role="radiogroup" aria-label="Leave days" className="h-[38px] flex items-center gap-[3px]">
          {Array.from({ length: c.leaveLimit }, (_, i) => i + 1).map(n => {
            const chosen = n <= c.leaveDays
            const over = chosen && n > c.leaveLeft
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === c.leaveDays}
                aria-label={`${n} leave day${n === 1 ? '' : 's'}`}
                onClick={() => c.onLeaveDaysChange(n)}
                className={[
                  'flex-1 h-[34px] rounded-lg text-[13px] font-extrabold',
                  over ? 'bg-amber-500 text-white' : chosen ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-500',
                  n === c.leaveDays ? 'ring-2 ring-offset-1 ring-slate-900' : '',
                ].join(' ')}
              >
                {n}
              </button>
            )
          })}
        </div>
      ) : (
        // py-1 leaves room for the ring on a picked chip inside the scrolling row.
        <div className="h-[38px] flex items-center justify-between gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
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
      )}

      <div className="flex gap-[5px]">
        <Tile
          tour="snap"
          value={snap ? '📍 ✓' : `📍 ${c.leaveLeft}`}
          label={snap ? 'Snapped' : 'Left · snap'}
          tone={snap ? 'leftOn' : c.leaveLeft ? 'leftLight' : 'empty'}
          pressed={snap}
          ariaLabel={snap ? `Snapped to the ${c.leaveLeft} days you have left. Tap to stop` : `${c.leaveLeft} leave days left. Tap to use them`}
          onClick={() => { c.onLeaveModeChange(snap ? 'manual' : 'snap'); setView('leave') }}
        />
        <Tile
          value={`🧳 ${c.leaveDays}`}
          label="Leave days"
          tone={view === 'leave' ? 'dark' : 'plain'}
          ariaLabel={`Leave days: ${c.leaveDays}. Show the leave days`}
          onClick={() => setView('leave')}
        />
        <div ref={limitRef} className="relative flex-1 min-w-0 flex">
          <Tile
            value={`${c.leaveLimit}▾`}
            label="Limit"
            tone={limitOpen ? 'dark' : 'plain'}
            ariaLabel={`Leave limit: ${c.leaveLimit}. Change`}
            onClick={() => setLimitOpen(o => !o)}
          />
          {limitOpen && (
            <div role="dialog" aria-label="Your leave limit" className="absolute bottom-[60px] left-1/2 -translate-x-[30%] z-30 w-[244px] p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200">
              <b className="text-[13px]">Your leave limit</b>
              <p className="m-0 mb-2 text-[11px] text-slate-500">The most leave days you plan with (shared with the Overview).</p>
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
        <Tile
          tour="colours"
          value={multiplier ? '↗ ⇆' : '📅 ⇆'}
          label={multiplier ? 'Multiplier' : 'Days off'}
          tone={view === 'colours' ? 'dark' : 'plain'}
          ariaLabel={view === 'colours' ? `Colouring by ${multiplier ? 'multiplier' : 'days off'}; tap to switch` : `Show the ${multiplier ? 'multiplier' : 'days off'} colours`}
          onClick={tapColours}
        />
        <Tile
          value="☰"
          label="Filters"
          badge={activeCount}
          ariaLabel={activeCount ? `Filters, ${activeCount} on` : 'Filters'}
          onClick={onOpenFilters}
        />
      </div>
    </div>
  )
}
