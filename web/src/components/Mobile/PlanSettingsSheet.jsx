import { useState } from 'react'
import { StepHeading } from '../Desktop/Overview/StepHeading'
import { LimitPicker } from '../Desktop/Overview/LimitPicker'
import { MoreOptions } from '../Desktop/Overview/MoreOptions'
import { BottomSheet } from './BottomSheet'

/**
 * The phone planner's settings, opened from the "10 days" button by the
 * period slider: the days off limit (1–10, the period's recommended number
 * marked REC; MIN / JOINS on Custom, Easter and Christmas) and Advanced options.
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
          <LimitPicker phone value={planner.leaveLimit} onChange={planner.setLimitAndLeave} rec={planner.listMode ? null : planner.rec?.leave} reason={planner.rec?.reason} {...planner.limitMarks} />
          {planner.maxLeave < planner.leaveLimit && (
            <span className="text-[11.5px] text-slate-600">
              {planner.leaveLeft < planner.leaveLimit && planner.maxLeave === Math.min(planner.leaveLeft, 10) ? `Uses ${planner.maxLeave}: what's left after your Summary.` : `Uses ${planner.maxLeave}: all the workdays in these dates.`}
            </span>
          )}
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
