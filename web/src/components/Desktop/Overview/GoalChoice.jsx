import { GOALS, summarise } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'

const GOAL_TEXT = {
  max: { title: '📈 Maximise my leave', short: '📈 Maximise', text: 'The best rate: the most days off for every leave day. Usually lots of long weekends.' },
  mix: { title: '⚖️ A mix of both', short: '⚖️ Mix', text: '2 or 3 proper holidays: a good rate, but longer breaks.' },
  long: { title: '🏝️ Longest time off', short: '🏝️ Longest', text: 'One continuous holiday, as long as possible. Lower rate.' },
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Step 3: what matters most. Each goal shows its real result, so the trade-off
 * between the best rate and the longest holiday is visible before tapping.
 * A goal that gives the same plan as a simpler one is switched off.
 *
 * Props:
 *   goals    – planGoals() result: { max, mix, long } each { breaks, same }
 *   value    – the goal in use
 *   onChange – (goal) => void
 *   phone    – compact three-part toggle
 */
export function GoalChoice({ goals, value, onChange, phone = false }) {
  const cantSplit = goals.mix.same && goals.max.same
  return (
    <div className="flex flex-col gap-1.5">
      {!phone && <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">3 · What matters most?</span>}
      <div role="radiogroup" aria-label="What matters most" className={phone ? 'flex p-[3px] gap-[3px] rounded-xl bg-slate-100' : 'grid grid-cols-3 gap-2'}>
        {GOALS.map(id => {
          const { breaks, same } = goals[id]
          const t = summarise(breaks)
          const on = id === value
          const result = `${t.daysOff} days off · ${formatMultiplier(t.multiplier)}`
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={same}
              title={same ? 'Gives the same plan as the option to its right for this period' : undefined}
              onClick={() => onChange(id)}
              className={phone
                ? `flex-1 py-1.5 px-1 rounded-[9px] text-[12px] font-bold leading-tight ${on ? 'bg-white text-slate-900 shadow' : same ? 'text-slate-300' : 'text-slate-600'}`
                : `text-left p-2.5 rounded-xl border-2 flex flex-col gap-1 bg-white ${on ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-300'} ${same ? 'opacity-40' : ''}`}
            >
              {phone ? (
                <>
                  <span className="block">{GOAL_TEXT[id].short}</span>
                  <span className="block text-[10.5px] text-indigo-800">{same ? '—' : `${t.daysOff} off · ${formatMultiplier(t.multiplier)}`}</span>
                </>
              ) : (
                <>
                  <span className="text-[13.5px] font-extrabold">{GOAL_TEXT[id].title}</span>
                  <span className="text-[11.5px] text-slate-600 leading-snug">{GOAL_TEXT[id].text}</span>
                  <span className="self-start px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11.5px] font-extrabold">
                    {same ? `Same as ${id === 'mix' ? 'Longest' : 'Mix'}` : `${result} · ${plural(t.breaks, 'break')}`}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
      {cantSplit
        ? <span className="text-[11.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">This period is too short to split into more breaks. Breaks need to be at least one working week apart.</span>
        : <span className="text-[11.5px] text-slate-600">↔ Breaks are at least <b>one working week</b> apart.</span>}
    </div>
  )
}
