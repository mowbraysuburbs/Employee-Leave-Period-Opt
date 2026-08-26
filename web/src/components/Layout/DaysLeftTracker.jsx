export function DaysLeftTracker({ budgetDays, usedDays, onClick, onDismiss, compact = false }) {
  const left = Math.max(0, budgetDays - usedDays)

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white transition-colors ${
        compact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
      }`}
    >
      <span className="font-medium opacity-90 whitespace-nowrap">
        {usedDays} of {budgetDays} days used
      </span>
      <span className="opacity-50 font-normal">|</span>
      <span className="font-bold whitespace-nowrap">{left} left</span>
      <span
        onClick={(e) => { e.stopPropagation(); onDismiss() }}
        className="ml-1 w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-white/20 text-xs leading-none"
        aria-label="Dismiss days-left tracker"
      >
        ×
      </span>
    </button>
  )
}
