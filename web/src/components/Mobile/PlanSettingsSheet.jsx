import { useState } from 'react'
import { GOALS, MAX_LEAVE, summarise } from '../../utils/planner'
import { formatMultiplier } from '../../utils/breaks'
import { StepHeading } from '../Desktop/Overview/StepHeading'
import { MoreOptions } from '../Desktop/Overview/MoreOptions'
import { BottomSheet } from './BottomSheet'

const AIMS = {
  max: { title: 'Maximise', text: 'The most days off per leave day' },
  mix: { title: 'Mix', text: '2 or 3 proper holidays' },
  long: { title: 'Longest', text: 'One long break' },
}

/**
 * The phone planner's settings, opened from the "10 days | Mix" button by the
 * period slider: the days off limit (1–10), the aim (with what each gives for
 * this period) and Advanced options.
 *
 * Props: planner – usePlanner() result; province, onProvinceChange; onClose
 */
export function PlanSettingsSheet({ planner, province, onProvinceChange, onClose }) {
  const [moreOpen, setMoreOpen] = useState(planner.moreCount > 0)
  return (
    <BottomSheet label="Plan settings" title="Plan settings" backdrop onClose={onClose}>
      <div className="px-4 pb-5 flex flex-col gap-4">
        <section className="flex flex-col gap-2">
          <StepHeading phone number={2}>Days off limit</StepHeading>
          <div role="radiogroup" aria-label="Days off limit" className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === planner.leaveLimit}
                onClick={() => planner.setLimitAndLeave(n)}
                className={`h-10 rounded-xl text-base font-extrabold ${n === planner.leaveLimit ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          {planner.maxLeave < planner.leaveLimit && <span className="text-[11.5px] text-slate-600">Uses {planner.maxLeave}: all the workdays in these dates.</span>}
        </section>
        <div className="h-px bg-slate-200" />
        <section className="flex flex-col gap-2">
          <StepHeading phone number={3}>Aim</StepHeading>
          <div role="radiogroup" aria-label="Aim" className="flex flex-col gap-1.5">
            {GOALS.map(id => {
              const t = summarise(planner.goals[id].breaks)
              const on = id === planner.goal
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => planner.setGoal(id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-left ${on ? 'border-slate-900' : 'border-slate-200'}`}
                >
                  <span className="flex-1">
                    <b className="block text-[13.5px]">{AIMS[id].title}</b>
                    <span className="text-[11.5px] text-slate-500">{AIMS[id].text}</span>
                  </span>
                  <span className="text-[11.5px] font-extrabold text-indigo-800">{t.daysOff} off · {formatMultiplier(t.multiplier)}</span>
                </button>
              )
            })}
          </div>
          <span className="text-[11px] text-slate-500">Breaks are always at least a working week apart.</span>
        </section>
        <section className="flex flex-col gap-2">
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 text-left"
          >
            <span className="flex-1">
              <b className="block text-[13px]">Advanced options</b>
              <span className="text-[11.5px] text-slate-500">School holidays, avoid / include months</span>
            </span>
            {planner.moreCount > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-sky-500 text-white text-[11px] font-extrabold leading-5 text-center">{planner.moreCount}</span>}
            <span aria-hidden="true" className={`text-sky-700 transition-transform ${moreOpen ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {moreOpen && <MoreOptions phone planner={planner} province={province} onProvinceChange={onProvinceChange} />}
        </section>
        <button type="button" onClick={onClose} className="h-12 rounded-2xl bg-slate-900 text-white text-[15px] font-bold">Show results</button>
      </div>
    </BottomSheet>
  )
}
