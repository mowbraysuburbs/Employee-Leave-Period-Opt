/**
 * A filter you turn on or off: its label on the left, an on/off switch on the
 * right (the same switch as "Snap to days left"). Used by the calendar rail's
 * Show card and the phone's More filters.
 *
 * Props: label; on; onChange – (boolean) => void; large – the phone size; ariaLabel – optional
 */
export function SwitchRow({ label, on, onChange, large = false, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={`w-full min-w-0 flex items-center justify-between gap-2 rounded-lg text-left font-semibold text-slate-900 ${large ? 'min-h-[42px] text-sm' : 'min-h-8 text-[13px]'}`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${on ? 'bg-sky-700' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}
