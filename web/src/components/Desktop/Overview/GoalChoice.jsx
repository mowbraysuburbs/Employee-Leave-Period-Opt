import { GOALS, summarise } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'
import { StepHeading } from './StepHeading'

const GOAL_TEXT = {
  max: { title: '📈 Maximise my leave', short: '📈 Maximise', text: 'The best rate: the most days off for every leave day. Usually lots of long weekends.' },
  mix: { title: '⚖️ A mix of both', short: '⚖️ Mix', text: '2 or 3 proper holidays: a good rate, but longer breaks.' },
  long: { title: '🏝️ Longest time off', short: '🏝️ Longest', text: 'One continuous holiday, as long as possible. Lower rate.' },
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Step 3: what matters most. Each goal shows its real result, so the trade-off
 * between the best rate and the longest holiday is visible before tapping. The
 * choice applies to every period; where a period can't split, nothing changes.
 *
 * Props:
 *   goals    – planGoals() result: { max, mix, long } each { breaks, same }
 *   value    – the goal in use
 *   onChange – (goal) => void
 *   phone    – compact three-part toggle
 */
export function GoalChoice({ goals, value, onChange, phone = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <StepHeading number={3} phone={phone} note={phone ? null : 'applies to every period'}>What matters most?</StepHeading>
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
              title={GOAL_TEXT[id].text}
              onClick={() => onChange(id)}
              className={`flex-1 rounded-[9px] font-bold leading-tight ${phone ? 'py-1.5 px-1 text-[12px]' : 'py-1.5 px-2 text-[13px]'} ${on ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span className="block">{phone ? GOAL_TEXT[id].short : GOAL_TEXT[id].title}</span>
              <span className={`block font-semibold whitespace-nowrap text-indigo-800 ${phone ? 'text-[10.5px]' : 'text-[11.5px]'}`}>
                {phone ? `${t.daysOff} off · ${formatMultiplier(t.multiplier)}` : `${t.daysOff} off · ${formatMultiplier(t.multiplier)} · ${plural(t.breaks, 'break')}`}
              </span>
            </button>
          )
        })}
      </div>
      <span className="text-[11.5px] text-slate-600">↔ Breaks are at least <b>one working week</b> apart.</span>
    </div>
  )
}
