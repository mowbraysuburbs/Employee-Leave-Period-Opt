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
  dates: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="15" x2="10" y2="15" /><line x1="14" y1="15" x2="16" y2="15" /></>,
  flag: <><path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>,
  school: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
}

// One icon button in the strip; every one opens the rail back up.
function RailIcon({ icon, label, value, className, onClick, tour }) {
  return (
    <button
      type="button"
      data-tour={tour}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`w-11 min-h-10 py-1.5 rounded-[10px] flex flex-col items-center justify-center gap-0.5 ${className}`}
    >
      <svg {...svgProps}>{ICONS[icon]}</svg>
      {value != null && <span className="text-[11px] font-extrabold leading-none">{value}</span>}
    </button>
  )
}

function monthsInPeriod(from, to) {
  const count = (Number(to.slice(0, 4)) - Number(from.slice(0, 4))) * 12 + Number(to.slice(5, 7)) - Number(from.slice(5, 7)) + 1
  return `${count} mo`
}

/**
 * The calendar's control column collapsed to a thin strip: one icon per
 * control showing its current state, so the calendar gets an extra column.
 * See ControlRail for props.
 */
export function RailCollapsed({ c }) {
  const open = c.onToggleCollapsed
  const filtering = c.colourBy === 'daysOff' && !c.picksOnly && c.daysOffFilter.length > 0
  const multiplier = c.colourBy === 'multiplier'
  const picked = [...c.daysOffFilter].sort((a, b) => a - b)
  const off = 'bg-transparent text-slate-400 hover:bg-slate-100'

  return (
    <aside aria-label="Calendar controls (collapsed)" className="w-[60px] shrink-0 h-full overflow-y-auto flex flex-col items-center gap-1.5 py-2 bg-white rounded-2xl shadow-sm">
      <button type="button" onClick={open} aria-label="Expand calendar controls" title="Expand controls" className="w-10 h-9 rounded-[10px] bg-slate-900 text-white text-[15px] font-bold">»</button>
      <span aria-hidden="true" className="w-8 h-px bg-slate-200 my-0.5" />
      <RailIcon tour="leave" icon="leave" label={`Leave days: ${c.leaveDays}`} value={c.leaveDays} onClick={open} className="border-2 border-sky-700 text-sky-800" />
      <RailIcon
        tour="colours"
        icon="days"
        label={`Colour by: ${multiplier ? 'Value' : 'Total days off'}`}
        value={multiplier ? '×' : 'days'}
        onClick={open}
        className={multiplier ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}
      />
      <RailIcon
        icon="filter"
        label={filtering ? `Days off filter: ${picked.join(', ')}` : 'Days off filter: off'}
        value={filtering ? picked.join('·') : null}
        onClick={open}
        className={filtering ? 'bg-slate-900 text-white' : off}
      />
      <RailIcon
        icon="dates"
        label={`Dates: ${c.period.from} to ${c.period.to}`}
        value={monthsInPeriod(c.period.from, c.period.to)}
        onClick={open}
        className={c.period.changed ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}
      />
      <RailIcon
        icon="flag"
        label={c.holidayFilter.length ? `Public holidays filter: ${c.holidayFilter.join(', ')}` : 'Public holidays filter: all'}
        value={c.holidayFilter.length || null}
        onClick={open}
        className={c.holidayFilter.length ? 'bg-slate-900 text-white' : off}
      />
      {c.previewCount > 0 && (
        <RailIcon
          icon="target"
          label={`Only selected dates: ${c.previewOnly ? 'on' : 'off'}`}
          value={c.previewCount}
          onClick={open}
          className={c.previewOnly ? 'bg-slate-900 text-white' : off}
        />
      )}
      <RailIcon icon="eye" label={`Only my breaks: ${c.picksOnly ? 'on' : 'off'}`} onClick={open} className={c.picksOnly ? 'bg-slate-900 text-white' : off} />
      <RailIcon
        icon="school"
        label={`School holidays: ${c.schoolOn ? 'on' : 'off'} (${c.provinceName})`}
        onClick={open}
        className={c.schoolOn ? 'bg-green-100 text-green-800' : off}
      />
    </aside>
  )
}
