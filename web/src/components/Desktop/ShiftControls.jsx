import { fmtShortRange } from '../../utils/dateFormat'

function ShiftButton({ target, direction, onShift }) {
  const earlier = direction === 'earlier'
  const label = earlier ? 'Earlier' : 'Later'
  return (
    <button
      type="button"
      disabled={!target}
      onClick={() => onShift(target.startDate)}
      aria-label={target ? `${label}: ${fmtShortRange(target.startDate, target.endDate)}, same result` : `No equal option ${label.toLowerCase()}`}
      className={`flex-1 min-w-0 h-12 px-3 rounded-xl border flex items-center gap-2 disabled:opacity-40 disabled:cursor-default ${earlier ? '' : 'flex-row-reverse text-right'} border-slate-300 bg-white hover:border-sky-600`}
    >
      <span aria-hidden="true" className="text-lg font-bold text-sky-700">{earlier ? '◀' : '▶'}</span>
      <span className="min-w-0 flex flex-col leading-tight">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-[13px] font-bold truncate">{target ? fmtShortRange(target.startDate, target.endDate) : 'None'}</span>
      </span>
    </button>
  )
}

/**
 * When neighbouring dates give exactly the same result, lets people slide
 * the break to the nearest equal option before or after.
 *
 * Props:
 *   shift   – findEqualShifts() result: { earlier, later, count }
 *   onShift – (startDate) => void
 */
export function ShiftControls({ shift, onShift }) {
  if (!shift || shift.count < 2) return null

  return (
    <section aria-label="Shift to an equal break" className="flex flex-col gap-2 p-3 rounded-2xl bg-sky-50 border border-sky-200">
      <p className="m-0 text-[13px] text-sky-900">
        <strong>{shift.count} options</strong> within a week give the same result. Shift the dates:
      </p>
      <div className="flex gap-2">
        <ShiftButton target={shift.earlier} direction="earlier" onShift={onShift} />
        <ShiftButton target={shift.later} direction="later" onShift={onShift} />
      </div>
    </section>
  )
}
