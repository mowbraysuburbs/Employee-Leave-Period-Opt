import { MAX_LEAVE } from '../../hooks/useLeavePlanner'

const STRIPES = 'repeating-linear-gradient(45deg,var(--color-slate-100,#f1f5f9),var(--color-slate-100,#f1f5f9) 3px,var(--color-slate-200,#e2e8f0) 3px,var(--color-slate-200,#e2e8f0) 6px)'

/**
 * Leave days as ten tappable blocks. Blue = chosen and within what you have
 * left, amber = chosen but more than you have left, striped = past your limit
 * (or more than the period allows). A green mark shows where your leave left ends.
 * Each block shows its number and lifts on hover, so it's clear you can tap it.
 *
 * Props:
 *   value, onChange – leave days (1–10)
 *   left            – leave left after your Summary, or null to hide the mark
 *   max             – highest you can pick (your limit, or fewer)
 *   compact         – smaller blocks, for the Overview's step 2
 */
export function LeaveBlocks({ value, onChange, left = null, max = MAX_LEAVE, compact = false }) {
  const showLeft = left !== null && left >= 1 && left < MAX_LEAVE
  return (
    <div className={`relative ${showLeft ? 'pt-3.5' : ''} ${compact ? 'w-[170px]' : 'w-full'}`}>
      {showLeft && (
        <span aria-hidden="true" className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${(left / MAX_LEAVE) * 100}%` }}>
          <span className="text-[9px] font-extrabold text-green-800 leading-none whitespace-nowrap">{left} left</span>
          <span className={`w-0.5 rounded bg-green-600 ${compact ? 'h-5' : 'h-8'}`} />
        </span>
      )}
      <div role="radiogroup" aria-label="Leave days" className="flex gap-[3px]">
        {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => {
          const blocked = n > max
          const chosen = n <= value
          const over = chosen && left !== null && n > left
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${n} leave day${n === 1 ? '' : 's'}`}
              disabled={blocked}
              title={blocked ? 'Past your limit' : `Use ${n} leave day${n === 1 ? '' : 's'}`}
              onClick={() => onChange(n)}
              className={[
                'flex-1 rounded flex items-center justify-center font-extrabold transition',
                compact ? 'h-4 text-[0px]' : 'h-6 text-[10.5px]',
                blocked ? 'cursor-not-allowed text-slate-300'
                  : `cursor-pointer hover:-translate-y-px hover:ring-2 hover:ring-sky-400 ${over ? 'bg-amber-500 text-white' : chosen ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`,
                n === value && !blocked ? 'ring-2 ring-offset-1 ring-slate-900' : '',
              ].join(' ')}
              style={blocked ? { background: STRIPES } : undefined}
            >
              {n}
            </button>
          )
        })}
      </div>
      {!compact && <div className="mt-1 text-[10px] text-slate-500">Tap a number to pick your leave days</div>}
    </div>
  )
}

/**
 * "5 / 10▾ limit": the leave days over your limit, where the limit is a
 * dropdown (1–10). Shared by the calendar card and the Overview's step 2.
 *
 * Props: value, limit, onLimitChange, idPrefix, size ('lg' | 'md')
 */
export function LeaveFraction({ value, limit, onLimitChange, idPrefix, size = 'lg' }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-extrabold leading-none ${size === 'lg' ? 'text-[28px]' : 'text-[22px]'}`}>{value}</span>
      <span className={`font-bold text-slate-400 ${size === 'lg' ? 'text-xl' : 'text-lg'}`}>/</span>
      <label htmlFor={`${idPrefix}-limit`} className="sr-only">Your leave limit</label>
      <select
        id={`${idPrefix}-limit`}
        value={limit}
        onChange={e => onLimitChange(Number(e.target.value))}
        className={`self-center rounded-lg border-[1.5px] border-sky-700 bg-sky-50 font-extrabold text-sky-800 pl-2 pr-1 ${size === 'lg' ? 'h-8 text-base' : 'h-7 text-sm'}`}
      >
        {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <span className="self-center text-[11.5px] font-bold text-slate-600">limit</span>
    </div>
  )
}
