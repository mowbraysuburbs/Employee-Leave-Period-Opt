const TABS = [
  { id: 'details', label: () => 'Details' },
  { id: 'summary', label: count => `Summary (${count})` },
]

/**
 * The right-hand panel: Details (the hovered break) and Summary (saved
 * breaks) share one space, switched by tabs. The tabs (plus `head`) stay
 * pinned at the top and `footer` at the bottom; only the middle scrolls.
 *
 * Props:
 *   tab, onTabChange – 'details' | 'summary'
 *   savedCount       – shown on the Summary tab
 *   details, summary – the content for each tab
 *   head             – pinned under the tabs (e.g. Add + dates on Details)
 *   footer           – pinned at the bottom (the leave bar)
 *   width            – Tailwind width classes
 *   onCollapse       – optional: shows a » button that collapses the panel (the calendar)
 */
export function SidePanel({ tab, onTabChange, savedCount, details, summary, head, footer, width = 'w-[300px] xl:w-[340px]', onCollapse }) {
  return (
    <aside className={`${width} shrink-0 h-full flex flex-col bg-white rounded-[20px] shadow-sm`}>
      <div className="px-[22px] pt-[22px] pb-3 flex flex-col gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
        <div role="tablist" aria-label="Side panel" data-tour="breaks" className="flex-1 flex p-1 rounded-xl bg-slate-100">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
              className={[
                'flex-1 h-[38px] rounded-lg text-sm font-bold',
                tab === t.id ? 'bg-white text-slate-900 shadow' : 'text-slate-600',
              ].join(' ')}
            >
              {t.label(savedCount)}
            </button>
          ))}
        </div>
          {onCollapse && (
            <button type="button" onClick={onCollapse} aria-label="Collapse details and summary" title="Collapse" className="shrink-0 w-9 h-[46px] rounded-xl border border-slate-300 bg-white text-[15px] font-bold text-slate-700 hover:border-slate-400">»</button>
          )}
        </div>
        {head}
      </div>
      <div role="tabpanel" className="flex-1 min-h-0 overflow-y-auto px-[22px] py-4">
        {tab === 'details' ? details : summary}
      </div>
      {footer}
    </aside>
  )
}
