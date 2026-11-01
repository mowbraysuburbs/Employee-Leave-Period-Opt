const MODES = [
  { id: 'daysOff', label: 'Total days off' },
  { id: 'multiplier', label: 'Multiplier' },
]

function helpText(colourBy, picksOnly, leaveDays) {
  if (picksOnly) return 'Showing only your breaks. Turn off "Only my breaks" to see the heatmap again.'
  if (colourBy === 'multiplier') {
    return `Each day shows its best deal using up to ${leaveDays} leave days. 3.0× means every leave day buys you three days away.`
  }
  return 'Total days off in a row if your leave starts on that day. Click numbers to show only those.'
}

/**
 * Props:
 *   colourBy  – 'daysOff' | 'multiplier'
 *   legend    – [{ label, colour }] low → high
 *   picksOnly – bool, swaps the help text while the heatmap is hidden
 *   leaveDays – the leave-days setting, quoted in the Multiplier help text
 *   daysOffFilter, onToggleDaysOff, onClearDaysOff
 *             – Days off mode only: legend numbers toggle a filter (array of values)
 */
export function ColourModeCard({ colourBy, onColourByChange, legend, picksOnly, leaveDays, daysOffFilter, onToggleDaysOff, onClearDaysOff }) {
  // The filter only applies to days off for now, so multiplier chips stay a plain key.
  const filterable = colourBy === 'daysOff' && !picksOnly
  const filtering = filterable && daysOffFilter.length > 0

  return (
    <section className="flex-[1_1_520px] bg-white rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-base font-bold">Colour the calendar by</span>
        <div role="group" aria-label="Colour the calendar by" className="inline-flex p-1 rounded-xl bg-slate-100">
          {MODES.map(m => (
            <button
              key={m.id}
              type="button"
              aria-pressed={colourBy === m.id}
              onClick={() => onColourByChange(m.id)}
              className={[
                'h-9 px-4 rounded-lg text-sm font-bold',
                colourBy === m.id ? 'bg-white text-slate-900 shadow' : 'text-slate-600',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <p className="m-0 text-[13px] text-slate-600">{helpText(colourBy, picksOnly, leaveDays)}</p>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs font-semibold text-slate-600 mr-1">Low</span>
        {legend.map(l => {
          const chip = 'min-w-7 h-6 px-1 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-slate-900'
          if (!filterable) {
            return <span key={l.label} className={chip} style={{ backgroundColor: l.colour }}>{l.label}</span>
          }
          const on = daysOffFilter.includes(l.value)
          return (
            <button
              key={l.label}
              type="button"
              aria-pressed={on}
              aria-label={`${on ? 'Hide' : 'Show only'} days with ${l.label} days off`}
              onClick={() => onToggleDaysOff(l.value)}
              className={`${chip} cursor-pointer ${on ? 'ring-2 ring-slate-900 ring-offset-1' : filtering ? 'opacity-30' : ''}`}
              style={{ backgroundColor: l.colour }}
            >
              {l.label}
            </button>
          )
        })}
        <span className="text-xs font-semibold text-slate-600 ml-1">High</span>
        {filtering && (
          <button type="button" onClick={onClearDaysOff} className="ml-2 h-6 px-2 rounded-md bg-slate-100 text-sky-700 text-xs font-bold">
            Clear
          </button>
        )}
      </div>
    </section>
  )
}
