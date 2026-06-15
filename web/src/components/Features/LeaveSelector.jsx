const MAX_LEAVE = 10

export function LeaveSelector({
  selected,
  onChange,
  showSchoolHols,
  onToggleSchool,
  provinceCode,
  onProvinceChange,
  provinces,
}) {
  function decrement() { onChange(Math.max(0, selected - 1)) }
  function increment() { onChange(Math.min(MAX_LEAVE, selected + 1)) }

  return (
    <div className="flex flex-col gap-4">

      {/* Leave day slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
            Annual leave days
          </p>
          {/* Value badge */}
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {selected === 0 ? 'Free days' : `${selected} day${selected === 1 ? '' : 's'}`}
          </span>
        </div>

        {/* − slider + row */}
        <div className="flex items-center gap-2">
          <button
            onClick={decrement}
            disabled={selected === 0}
            className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-lg font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease leave days"
          >
            −
          </button>

          <input
            type="range"
            min={0}
            max={MAX_LEAVE}
            value={selected}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-full accent-sky-500 cursor-pointer"
          />

          <button
            onClick={increment}
            disabled={selected === MAX_LEAVE}
            className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-lg font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase leave days"
          >
            +
          </button>
        </div>

        {/* Tick marks: 0 … MAX */}
        <div className="flex justify-between px-5 -mt-1">
          {Array.from({ length: MAX_LEAVE + 1 }, (_, i) => (
            <span key={i} className="text-[9px] text-slate-400 dark:text-slate-600 tabular-nums">
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* School holiday toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 dark:text-slate-300">School holidays</span>
        <button
          onClick={onToggleSchool}
          role="switch"
          aria-checked={showSchoolHols}
          className={`relative inline-flex w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none ${
            showSchoolHols ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              showSchoolHols ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Province selector */}
      {showSchoolHols && (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
            Province
          </p>
          <select
            value={provinceCode}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
          >
            {provinces.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
