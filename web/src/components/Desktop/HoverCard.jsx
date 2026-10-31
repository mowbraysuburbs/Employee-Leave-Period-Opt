import { DayStrip } from './DayStrip'
import { fmtDay } from '../../utils/dateFormat'
import { formatMultiplier } from '../../utils/breaks'

function Stat({ value, label, accent }) {
  return (
    <div className="bg-slate-800 rounded-lg p-2">
      <div className={`text-xl font-extrabold ${accent ? 'text-amber-300' : ''}`}>{value}</div>
      <div className="text-[11px] text-slate-300">{label}</div>
    </div>
  )
}

// Quick preview above a hovered day: three numbers and a day strip, no sentences.
export function HoverCard({ brk }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30 bottom-10 left-1/2 -ml-[125px] w-[250px] text-left bg-slate-900 text-white rounded-xl px-3.5 py-3 shadow-2xl flex flex-col gap-2.5"
    >
      <div className="text-[13px] font-bold">{fmtDay(brk.startDate)} – {fmtDay(brk.endDate)}</div>
      <div className="grid grid-cols-3 gap-1.5">
        <Stat value={brk.daysOff} label="days off" />
        <Stat value={brk.leaveDays} label="leave" />
        <Stat value={formatMultiplier(brk.multiplier)} label="multiplier" accent />
      </div>
      <DayStrip days={brk.days} />
    </div>
  )
}
