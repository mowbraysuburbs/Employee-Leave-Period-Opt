/**
 * Above the desktop calendar: which filters are on, each removable, plus
 * Clear all. Hidden when nothing is filtered.
 *
 * Props:
 *   filters  – [{ key, label, value, clear }] from useLeavePlanner
 *   onClearAll
 */
export function ActiveFiltersBar({ filters, onClearAll }) {
  if (filters.length === 0) return null

  return (
    <div role="region" aria-label="Active filters" className="shrink-0 flex flex-wrap items-center gap-1.5 px-2.5 py-2 bg-white border border-sky-200 rounded-2xl">
      <span className="mr-0.5 text-xs font-extrabold text-sky-700">
        {filters.length} {filters.length === 1 ? 'filter' : 'filters'} on
      </span>
      {filters.map(f => (
        <span key={f.key} className="h-7 pl-2.5 pr-1 rounded-full bg-sky-50 border border-sky-200 inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
          <strong>{f.label}{f.value ? ':' : ''}</strong>
          {f.value && <span className="text-slate-700">{f.value}</span>}
          <button
            type="button"
            aria-label={`Remove ${f.label} filter`}
            onClick={f.clear}
            className="w-[18px] h-[18px] rounded-full bg-sky-100 text-sky-700 text-[10px] font-extrabold"
          >
            ✕
          </button>
        </span>
      ))}
      <button type="button" onClick={onClearAll} className="ml-auto h-7 px-2.5 rounded-full text-xs font-bold text-sky-700 hover:bg-sky-50">
        Clear all
      </button>
    </div>
  )
}
