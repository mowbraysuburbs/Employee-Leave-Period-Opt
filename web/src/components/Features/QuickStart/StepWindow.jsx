import { useState } from 'react'
import { monthOptions } from '../../../utils/quickStart'

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

export function StepWindow({ todayStr, datasetEnd, onChoose, onBack, onSkip }) {
  const [customOpen, setCustomOpen] = useState(false)
  const options = monthOptions(todayStr, datasetEnd)
  const [fromMonth, setFromMonth] = useState(options[0].value)
  const [toMonth, setToMonth] = useState(options[Math.min(3, options.length - 1)].value)

  return (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Step 2 of 4</p>
        <button onClick={onSkip} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">Skip</button>
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Which period do you want to plan for?</h2>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => onChoose('biggest')}
          className="flex items-center justify-between text-left px-4 py-4 rounded-2xl bg-sky-500 text-white"
        >
          <span>
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-bold">Biggest leave coming up</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full">Default</span>
            </span>
            <span className="block text-xs opacity-85 mt-0.5">Skips straight to your answer — no more questions needed</span>
          </span>
          <ChevronIcon />
        </button>

        <button
          onClick={() => onChoose('next6')}
          className="flex items-center justify-between text-left px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
        >
          <span className="text-[15px] font-bold">Next 6 months</span>
          <ChevronIcon />
        </button>

        <button
          onClick={() => setCustomOpen((v) => !v)}
          className="flex items-center justify-between text-left px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
        >
          <span className="text-[15px] font-bold">Choose months…</span>
          <ChevronIcon />
        </button>

        {customOpen && (
          <div className="flex flex-col gap-3 px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">From</label>
                <select
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                >
                  {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">To</label>
                <select
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                >
                  {options.filter((o) => o.value >= fromMonth).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => onChoose('custom', fromMonth, toMonth)}
              className="self-end px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors"
            >
              Use these months
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-start">
        <button onClick={onBack} className="px-5 py-2 rounded-full text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Back
        </button>
      </div>
    </div>
  )
}
