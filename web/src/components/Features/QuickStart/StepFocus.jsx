import { useState } from 'react'
import { fmtNice } from '../../../utils/dateFormat'

export function StepFocus({ holidays, onNext, onBack, onSkip }) {
  const [selected, setSelected] = useState(new Set())

  function toggle(date) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5 px-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Step 4 of 4</p>
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-sky-500 bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded-full">Continuous only</span>
        </div>
        <button onClick={onSkip} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">Skip</button>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Any holidays you want to build around?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We'll favour these if there's a good option — otherwise we'll still show you the best overall.</p>
      </div>

      <button
        onClick={() => onNext(new Set())}
        className="self-start px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold"
      >
        No preference — skip this
      </button>

      {holidays.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Holidays in your window</p>
          {holidays.map(({ date, name }) => {
            const isSelected = selected.has(date)
            return (
              <button
                key={date}
                onClick={() => toggle(date)}
                className={`flex items-center justify-between text-left px-4 py-3 rounded-xl border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-sky-500 border-2'
                    : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600'
                }`}
              >
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-sky-500' : 'text-slate-500 dark:text-slate-400'}`}>{fmtNice(date)}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-5 py-2 rounded-full text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Back
        </button>
        <button
          onClick={() => onNext(selected)}
          className="px-7 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-colors"
        >
          Calculate
        </button>
      </div>
    </div>
  )
}
