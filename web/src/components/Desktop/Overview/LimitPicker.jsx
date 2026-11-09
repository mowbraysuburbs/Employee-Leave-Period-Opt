import { MAX_LEAVE } from '../../../utils/planner'

/**
 * The days off limit as numbers 1–10, with the period's recommended number
 * marked "REC" (an amber ring and a small tag on top). Desktop: one row;
 * phone: a 5 × 2 grid.
 * List periods (Custom, Easter, Christmas): numbers where holidays join get a
 * JOINS tag (its title names them), the first proper break a MIN tag, and
 * numbers that add nothing new (marks 'pad') are struck through and can't be
 * picked (unless it's already your number). See "Leave number rules" in CLAUDE.md.
 *
 * Props: value, onChange – the limit; rec – recommended days or null; reason – its tag;
 *   marks – 10 entries from customLeaveMap or null; joins – [{ leave, names }]; phone
 */
export function LimitPicker({ value, onChange, rec = null, reason = '', marks = null, joins = [], phone = false }) {
  return (
    <div role="radiogroup" aria-label="Days off limit" className={phone ? 'grid grid-cols-5 gap-x-1.5 gap-y-3 pt-2' : 'flex gap-0.5 pt-2.5'}>
      {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => {
        const on = n === value
        const isRec = n === rec
        const join = joins.find(j => j.leave === n)
        const pad = marks?.[n - 1] === 'pad'
        const min = marks?.[n - 1] === 'min'
        const tag = isRec ? 'REC' : join ? 'JOINS' : min ? 'MIN' : null
        const skipped = pad && !on
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${n}${isRec ? ' (recommended)' : join ? ` (joins ${join.names.join(' + ')})` : min ? ' (first proper break)' : skipped ? ' (adds nothing here)' : ''}`}
            disabled={skipped}
            title={isRec ? `Recommended: ${n} leave days${reason ? ` (${reason})` : ''}`
              : join ? `${n} leave days: ${join.names.join(' + ')} join into one break`
                : min ? `${n} leave days: the first proper break here`
                  : pad ? `${n} leave days: nothing new here, it only makes a break a day longer` : `${n} leave days`}
            onClick={() => onChange(n)}
            className={[
              'relative rounded-lg font-extrabold',
              phone ? 'h-10 text-base' : 'w-6 h-8 text-[13px]',
              on ? 'bg-sky-700 text-white' : skipped ? 'bg-slate-50 text-slate-300 line-through cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              tag ? (min ? 'ring-2 ring-green-600' : 'ring-2 ring-amber-500') : '',
            ].join(' ')}
          >
            {n}
            {tag && (
              <span aria-hidden="true" className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-1 rounded text-white text-[8.5px] leading-[13px] font-extrabold tracking-wide ${min ? 'bg-green-600' : 'bg-amber-500'}`}>
                {tag}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
