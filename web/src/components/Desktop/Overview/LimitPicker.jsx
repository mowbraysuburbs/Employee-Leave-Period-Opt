import { MAX_LEAVE } from '../../../utils/planner'

/**
 * The days off limit as numbers 1–10, with the period's recommended number
 * marked "REC" (an amber ring and a small tag on top). Desktop: one row;
 * phone: a 5 × 2 grid.
 *
 * Props: value, onChange – the limit; rec – recommended days or null; reason – its tag; phone
 */
export function LimitPicker({ value, onChange, rec = null, reason = '', phone = false }) {
  return (
    <div role="radiogroup" aria-label="Days off limit" className={phone ? 'grid grid-cols-5 gap-x-1.5 gap-y-3 pt-2' : 'flex gap-1 pt-2.5'}>
      {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => {
        const on = n === value
        const isRec = n === rec
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${n}${isRec ? ' (recommended)' : ''}`}
            title={isRec ? `Recommended: ${n} leave days${reason ? ` (${reason})` : ''}` : `${n} leave days`}
            onClick={() => onChange(n)}
            className={[
              'relative rounded-lg font-extrabold',
              phone ? 'h-10 text-base' : 'w-7 h-8 text-[13px]',
              on ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              isRec ? 'ring-2 ring-amber-500' : '',
            ].join(' ')}
          >
            {n}
            {isRec && (
              <span aria-hidden="true" className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1 rounded bg-amber-500 text-white text-[8.5px] leading-[13px] font-extrabold tracking-wide">
                REC
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
