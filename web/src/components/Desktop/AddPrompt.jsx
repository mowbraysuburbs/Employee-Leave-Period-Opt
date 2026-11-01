import { fmtShortRange } from '../../utils/dateFormat'

// Shown above a clicked day: confirm adding (or removing) that day's break.
export function AddPrompt({ brk, isSaved, onConfirm, onCancel }) {
  const verb = isSaved ? 'Remove' : 'Add'
  const question = `${verb} ${fmtShortRange(brk.startDate, brk.endDate)}?`

  return (
    <div
      role="dialog"
      aria-label={question}
      onKeyDown={e => e.key === 'Escape' && onCancel()}
      className="absolute z-40 bottom-10 left-1/2 -translate-x-1/2 w-[176px] bg-white border border-slate-200 rounded-xl p-2.5 shadow-xl flex flex-col gap-2 text-center"
    >
      <div className="text-[13px] font-bold text-slate-900">{question}</div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 text-[13px] font-bold"
        >
          Cancel
        </button>
        <button
          type="button"
          autoFocus
          onClick={onConfirm}
          className={`flex-1 h-8 rounded-lg text-white text-[13px] font-bold ${isSaved ? 'bg-red-700' : 'bg-sky-700'}`}
        >
          {verb}
        </button>
      </div>
    </div>
  )
}
