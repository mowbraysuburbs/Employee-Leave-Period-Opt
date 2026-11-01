const MODES = [
  { id: 'daysOff', label: 'Total days off' },
  { id: 'multiplier', label: 'Multiplier' },
]

function helpText(colourBy, picksOnly, leaveDays) {
  if (picksOnly) return 'Showing only your breaks. Turn off "Only my breaks" to see the heatmap again.'
  if (colourBy === 'multiplier') {
    return `Each day shows its best deal using up to ${leaveDays} leave days. 3.0× means every leave day buys you three days away.`
  }
  return 'Total days off in a row if your leave starts on that day.'
}

/**
 * Props:
 *   colourBy  – 'daysOff' | 'multiplier'
 *   legend    – [{ label, colour }] low → high
 *   picksOnly – bool, swaps the help text while the heatmap is hidden
 *   leaveDays – the leave-days setting, quoted in the Multiplier help text
 */
export function ColourModeCard({ colourBy, onColourByChange, legend, picksOnly, leaveDays }) {
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
        {legend.map(l => (
          <span
            key={l.label}
            className="min-w-7 h-6 px-1 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-slate-900"
            style={{ backgroundColor: l.colour }}
          >
            {l.label}
          </span>
        ))}
        <span className="text-xs font-semibold text-slate-600 ml-1">High</span>
      </div>
    </section>
  )
}
