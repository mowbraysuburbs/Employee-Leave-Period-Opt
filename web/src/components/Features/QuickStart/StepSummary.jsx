import { useState } from 'react'
import { fmtRangeNice } from '../../../utils/dateFormat'

function periodKey(p) {
  return `${p.startDate}-${p.leaveDaysUsed}`
}

export function StepSummary({ picks, focusFallback, onEdit, onAccept }) {
  const [selectedKey, setSelectedKey] = useState(picks[0] ? periodKey(picks[0]) : null)
  const selected = picks.find((p) => periodKey(p) === selectedKey) ?? null

  if (picks.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-6 pb-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">No matches in this window</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Try a bigger budget or a wider date range.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-6 pb-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Continuous · top {picks.length}</p>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">Pick your break</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your top {picks.length} option{picks.length === 1 ? '' : 's'} in this window. Pick one — the rest stay one tap away in the table.
        </p>
      </div>

      {focusFallback && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/40">
          <span className="text-sky-500 text-sm">ⓘ</span>
          <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
            None of these land on your chosen holidays, so here's the best overall instead.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {picks.map((p, i) => {
          const key = periodKey(p)
          const isSelected = key === selectedKey
          const [startLabel, endLabel] = fmtRangeNice(p.startDate, p.endDate)
          return (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`text-left px-4 py-3.5 rounded-2xl border ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-sky-500 border-2 ring-4 ring-sky-100 dark:ring-sky-900/30'
                  : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">{p.daysOff}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">days off</span>
                  {i === 0 && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-white bg-sky-500 px-2 py-0.5 rounded-full">Best</span>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{p.leaveDaysUsed} leave day{p.leaveDaysUsed === 1 ? '' : 's'}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{startLabel} – {endLabel}</p>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(selected)}
          className="flex-1 px-4 py-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors"
        >
          Edit in table
        </button>
        <button
          onClick={() => onAccept(selected)}
          className="flex-1 px-4 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-colors"
        >
          Use selected
        </button>
      </div>
    </div>
  )
}
