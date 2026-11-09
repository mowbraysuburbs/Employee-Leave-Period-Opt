import { useEffect, useRef, useState } from 'react'
import { LeaveCard } from '../LeaveCard'
import { PeriodPicker } from '../PeriodPicker'
const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const ICONS = {
  leave: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  days: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  // Funnel with a cross, for Clear filters.
  clearFilter: <><path d="M13 3H2l8 9.46V19l4 2v-8.54" /><path d="M16 4l6 6M22 4l-6 6" /></>,
  dates: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="15" x2="10" y2="15" /><line x1="14" y1="15" x2="16" y2="15" /></>,
  // Beach umbrella for the public holidays filter.
  holiday: <><path d="M3 11a9 7 0 0 1 18 0z" /><path d="M8 11a4 7 0 0 1 8 0" /><path d="M12 4v1" /><path d="M12 11l-2 10" /><path d="M3 21h18" /></>,
  // A bridge between two banks, for Leave fills a gap.
  gap: <><path d="M2 18h20" /><path d="M4 18v-6M20 18v-6" /><path d="M4 12c4 0 5-4 8-4s4 4 8 4" /><path d="M9 18v-4M15 18v-4" /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>,
  school: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
}

// The blue dot on an icon whose filter is on.
function ActiveDot() {
  return <span aria-hidden="true" className="absolute -top-1 -right-1 w-[11px] h-[11px] rounded-full bg-sky-500 border-2 border-white" />
}

// One icon button in the strip; every one opens the rail back up.
function RailIcon({ icon, label, value, className, onClick, tour, dot = false, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      data-tour={tour}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`relative w-11 min-h-10 py-1.5 rounded-[10px] flex flex-col items-center justify-center gap-0.5 ${className}`}
    >
      <svg {...svgProps}>{ICONS[icon]}</svg>
      {value != null && <span className="text-[11px] font-extrabold leading-none">{value}</span>}
      {dot && <ActiveDot />}
    </button>
  )
}

/**
 * The days-off filter as coloured chips, two per row; tap a chip to filter
 * that value on or off straight from the strip. Picked chips get a ring and
 * the rest fade, like the phone's chips.
 */
function DaysOffKey({ legend, picked, onToggle }) {
  const filtering = picked.length > 0
  return (
    <div className={`relative w-11 h-full py-1.5 rounded-[10px] flex flex-col items-center gap-1 ${filtering ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
      {filtering && <ActiveDot />}
      <svg {...svgProps} width={16} height={16}>{ICONS.filter}</svg>
      <span className="grid grid-cols-2 gap-[3px]">
        {legend.map(l => {
          const on = picked.includes(l.value)
          return (
            <button
              key={l.value}
              type="button"
              aria-pressed={on}
              aria-label={`Show only days with ${l.label} days off`}
              title={`${l.label} days off`}
              onClick={() => onToggle(l.value)}
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${on ? 'ring-2 ring-white' : filtering ? 'opacity-35' : ''}`}
              style={{ backgroundColor: l.colour, color: '#0f172a' }}
            >
              {l.label}
            </button>
          )
        })}
      </span>
    </div>
  )
}

function monthsInPeriod(from, to) {
  const count = (Number(to.slice(0, 4)) - Number(from.slice(0, 4))) * 12 + Number(to.slice(5, 7)) - Number(from.slice(5, 7)) + 1
  return `${count} mo`
}

/**
 * The calendar's control column collapsed to a thin strip: one icon per
 * control showing its current state, so the calendar gets an extra column.
 * Most icons act straight away (colour by, days-off chips, public holidays,
 * Selected, school, plan dates); leave days and dates pop out a small window beside the strip. See ControlRail for props.
 */
export function RailCollapsed({ c }) {
  const open = c.onToggleCollapsed
  // The days-off filter (and so the colour key) only applies in Total days mode.
  const filterable = c.colourBy === 'daysOff' && !c.picksOnly
  const multiplier = c.colourBy === 'multiplier'
  const picked = [...c.daysOffFilter].sort((a, b) => a - b)
  const off = 'bg-transparent text-slate-400 hover:bg-slate-100'

  // The leave days pop-out sits beside the strip (the strip scrolls, so it
  // can't live inside it), lined up with the leave icon.
  const wrapRef = useRef(null)
  const leaveRef = useRef(null)
  const datesRef = useRef(null)
  // The open pop-out: { kind: 'leave' | 'dates', top } or null.
  const [popout, setPopout] = useState(null)
  useEffect(() => {
    if (!popout) return
    const close = e => { if (!wrapRef.current?.contains(e.target)) setPopout(null) }
    const esc = e => { if (e.key === 'Escape') setPopout(null) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [popout])
  function togglePopout(kind, ref) {
    if (popout?.kind === kind) return setPopout(null)
    const icon = ref.current.getBoundingClientRect()
    const wrap = wrapRef.current.getBoundingClientRect()
    setPopout({ kind, top: icon.top - wrap.top })
  }

  return (
    <div ref={wrapRef} className="relative shrink-0 h-full">
      <aside aria-label="Calendar controls (collapsed)" className="w-[60px] h-full overflow-y-auto flex flex-col items-center gap-1.5 py-2 bg-white rounded-2xl shadow-sm">
        <button type="button" onClick={open} aria-label="Expand calendar controls" title="Expand controls" className="w-10 h-9 rounded-[10px] bg-slate-900 text-white text-[15px] font-bold">»</button>
        <span aria-hidden="true" className="w-8 h-px bg-slate-200 my-0.5" />
        <span ref={leaveRef}>
          <RailIcon tour="leave" icon="leave" label={`Leave days: ${c.leaveDays} of your ${c.leaveLimit} limit (${c.leaveLeft} left). Change`} value={<>{c.leaveDays}<span className="opacity-60">|{c.leaveLimit}</span></>} onClick={() => togglePopout('leave', leaveRef)} className={`border-2 border-sky-700 ${popout?.kind === 'leave' ? 'bg-sky-700 text-white' : 'text-sky-800'}`} />
        </span>
        <RailIcon
          tour="colours"
          icon="days"
          label={`Colour by: ${multiplier ? 'Multiplier' : 'Total days off'}. Switch to ${multiplier ? 'Total days' : 'Multiplier'}`}
          value={multiplier ? 'mult' : 'days'}
          onClick={() => c.onColourByChange(multiplier ? 'daysOff' : 'multiplier')}
          className={multiplier ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}
        />
        {/* A fixed height (room for the most chips there can be, 9), so switching
            mode or leave days never moves the icons below. */}
        <div className="shrink-0 h-[124px]">
          {filterable ? (
            <DaysOffKey legend={c.legend} picked={picked} onToggle={c.onToggleDaysOff} />
          ) : (
            <button
              type="button"
              onClick={() => c.onColourByChange('daysOff')}
              aria-label="Days off filter: only with Total days. Switch to Total days"
              title="The days-off filter works with Total days"
              className="w-11 h-full rounded-[10px] bg-slate-50 text-slate-400 hover:bg-slate-100 flex flex-col items-center justify-center gap-1"
            >
              <svg {...svgProps} width={16} height={16}>{ICONS.filter}</svg>
              <span className="text-[9px] font-bold leading-tight text-center">Total days<br />only</span>
            </button>
          )}
        </div>
        <span ref={datesRef}>
          <RailIcon
            icon="dates"
            label={`Dates: ${c.period.from} to ${c.period.to}. Change`}
            value={monthsInPeriod(c.period.from, c.period.to)}
            onClick={() => togglePopout('dates', datesRef)}
            className={popout?.kind === 'dates' ? 'bg-sky-700 text-white' : c.period.changed ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}
            dot={c.period.changed}
          />
        </span>
        {/* Holidays: one tap shows only breaks that include a public holiday (any
            of them); tap again for all breaks. Picking particular holidays is in the rail. */}
        <RailIcon
          icon="holiday"
          label={
            c.holidayFilter.length === 0 ? 'Only breaks with a public holiday: off'
              : c.holidayFilter.length >= c.holidayOptions.length ? 'Only breaks with a public holiday: on'
                : `Public holidays filter: ${c.holidayFilter.join(', ')}. Tap to clear`
          }
          value={c.holidayFilter.length && c.holidayFilter.length < c.holidayOptions.length ? c.holidayFilter.length : null}
          onClick={() => c.onHolidayFilterChange(c.holidayFilter.length ? [] : c.holidayOptions.map(o => o.name))}
          className={c.holidayFilter.length ? 'bg-slate-900 text-white' : off}
          dot={c.holidayFilter.length > 0}
        />
        {c.previewCount > 0 && (
          <RailIcon
            icon="target"
            label={`Only plan dates: ${c.previewOnly ? 'on' : 'off'}`}
            value={c.previewCount}
            onClick={() => c.onPreviewOnlyChange(!c.previewOnly)}
            className={c.previewOnly ? 'bg-slate-900 text-white' : off}
          />
        )}
        <RailIcon icon="gap" label={`Leave fills a gap: ${c.gapOnly ? 'on' : 'off'}`} onClick={() => c.onGapOnlyChange(!c.gapOnly)} className={c.gapOnly ? 'bg-slate-900 text-white' : off} dot={c.gapOnly} />
        <RailIcon icon="eye" label={`Selected breaks only: ${c.picksOnly ? 'on' : 'off'}`} onClick={() => c.onPicksOnlyChange(!c.picksOnly)} className={c.picksOnly ? 'bg-slate-900 text-white' : off} dot={c.picksOnly} />
        <RailIcon
          icon="school"
          label={`School holidays: ${c.schoolOn ? 'on' : 'off'} (${c.provinceName})`}
          onClick={() => c.onSchoolOnChange(!c.schoolOn)}
          className={c.schoolOn ? 'bg-slate-900 text-white' : off}
          dot={c.schoolOn}
        />
        <RailIcon
          icon="clearFilter"
          label={c.activeCount ? `Clear all filters (${c.activeCount})` : 'No filters on'}
          value={c.activeCount || null}
          onClick={c.onClearAll}
          disabled={!c.activeCount}
          className={c.activeCount ? 'mt-auto border border-red-300 text-red-700 hover:bg-red-50' : 'mt-auto text-slate-300'}
        />
      </aside>
      {popout && (
        <div role="dialog" aria-label={popout.kind === 'leave' ? 'Leave days' : 'Dates'} className="absolute left-full ml-2 z-40 w-[260px] p-2 bg-white rounded-2xl shadow-xl border border-slate-200" style={{ top: Math.max(0, popout.top - 8) }}>
          {popout.kind === 'leave'
            ? <LeaveCard c={c} idPrefix="flyout" />
            : <div className="p-2"><PeriodPicker idPrefix="flyout-period" {...c.period} /></div>}
        </div>
      )}
    </div>
  )
}
