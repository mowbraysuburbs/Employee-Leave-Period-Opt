const TABS = [
  { id: 'heatmap', label: 'Heatmap', icon: '📅' },
  { id: 'planner', label: 'Planner', icon: '📋' },
  { id: 'holidays', label: 'Holidays', icon: '🗓' },
]

/**
 * Bottom tab bar shown on mobile.
 * Props:
 *   activeTab – string tab id
 *   onChange  – callback(tabId: string)
 */
export function BottomTabBar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex md:hidden">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
            activeTab === id
              ? 'text-sky-500 dark:text-sky-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
