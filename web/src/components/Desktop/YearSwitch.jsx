/**
 * Segmented control for the plan year, shared by the Overview header and
 * the calendar's quick-pick previews.
 *
 * Props:
 *   years    – [{ value, label }]
 *   value    – selected year
 *   onChange – (year) => void
 */
export function YearSwitch({ years, value, onChange }) {
  return (
    <div role="group" aria-label="Year to plan" className="flex p-1 rounded-xl bg-slate-200">
      {years.map(y => (
        <button
          key={y.value}
          type="button"
          aria-pressed={y.value === value}
          onClick={() => onChange(y.value)}
          className={[
            'flex-1 h-9 px-3.5 rounded-lg text-sm font-bold whitespace-nowrap',
            y.value === value ? 'bg-white text-slate-900 shadow' : 'text-slate-600',
          ].join(' ')}
        >
          {y.label}
        </button>
      ))}
    </div>
  )
}
