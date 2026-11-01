const TABS = [
  { id: 'details', label: () => 'Details' },
  { id: 'summary', label: count => `Summary (${count})` },
]

/**
 * The right-hand panel: Details (the hovered break) and Summary (saved
 * breaks) share one space, switched by tabs.
 *
 * Props:
 *   tab, onTabChange – 'details' | 'summary'
 *   savedCount       – shown on the Summary tab
 *   details, summary – the content for each tab
 */
export function SidePanel({ tab, onTabChange, savedCount, details, summary }) {
  return (
    <aside className="w-[300px] xl:w-[340px] shrink-0 h-full overflow-y-auto bg-white rounded-[20px] p-[22px] shadow-sm">
      <div role="tablist" aria-label="Side panel" data-tour="breaks" className="flex p-1 rounded-xl bg-slate-100 mb-[18px]">
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
      <div role="tabpanel">{tab === 'details' ? details : summary}</div>
    </aside>
  )
}
