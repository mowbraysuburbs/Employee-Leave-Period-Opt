import { GOALS, summarise } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'
import { StepHeading } from './StepHeading'

const GOAL_TEXT = {
  max: { short: '📈 Maximise', text: 'The best rate: the most days off for every leave day. Usually lots of long weekends.' },
  mix: { short: '⚖️ Mix', text: '2 or 3 proper holidays: a good rate, but longer breaks.' },
  long: { short: '🏝️ Longest', text: 'One continuous holiday, as long as possible. Lower rate.' },
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Step 3: what matters most. Each goal shows its real result, so the trade-off
 * between the best rate and the longest holiday is visible (on hover on desktop,
 * under each label on phones). The choice applies to every period; where a
 * period can't split, nothing changes.
 *
 * Props:
 *   goals    – planGoals() result: { max, mix, long } each { breaks, same }
 *   value    – the goal in use
 *   onChange – (goal) => void
 *   phone    – compact three-part toggle
 */
export function GoalChoice({ goals, value, onChange, phone = false }) {
  return (
    <div className={phone ? 'flex flex-col gap-1.5' : 'flex items-center gap-2.5'}>
      <StepHeading number={3} phone={phone}>What matters most?</StepHeading>
      <div role="radiogroup" aria-label="What matters most" className="flex p-[3px] gap-[3px] rounded-xl bg-slate-100">
        {GOALS.map(id => {
          const { breaks } = goals[id]
          const t = summarise(breaks)
          const on = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              title={`${GOAL_TEXT[id].text} ${t.daysOff} days off · ${formatMultiplier(t.multiplier)} · ${plural(t.breaks, 'break')}`}
              onClick={() => onChange(id)}
              className={`rounded-[9px] font-bold leading-tight whitespace-nowrap ${phone ? 'flex-1 py-1.5 px-1 text-[12px]' : 'h-8 px-3 text-[13px]'} ${on ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {GOAL_TEXT[id].short}
              {/* Phones have no hover, so they show each result under the label. */}
              {phone && <span className="block font-semibold text-[10.5px] text-indigo-800">{t.daysOff} off · {formatMultiplier(t.multiplier)}</span>}
            </button>
          )
        })}
      </div>
      {phone && <span className="text-[11.5px] text-slate-600">↔ Breaks are at least <b>one working week</b> apart.</span>}
    </div>
  )
}
