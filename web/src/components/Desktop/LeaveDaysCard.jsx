const stepButton = 'w-11 h-11 rounded-full text-2xl font-semibold leading-none disabled:opacity-40'

export function LeaveDaysCard({ value, min, max, onChange }) {
  return (
    <section className="flex-[1_1_420px] bg-white border-2 border-sky-700 rounded-2xl px-5 py-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <label htmlFor="leave-days-range" className="text-base font-bold">Your leave days</label>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">Change me</span>
          </div>
          <p className="m-0 mt-1 text-[13px] text-slate-600">Try different amounts and watch the calendar update.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Fewer leave days"
            disabled={value <= min}
            onClick={() => onChange(value - 1)}
            className={`${stepButton} bg-slate-200 text-slate-900`}
          >
            −
          </button>
          <span className="min-w-10 text-center text-4xl font-extrabold">{value}</span>
          <button
            type="button"
            aria-label="More leave days"
            disabled={value >= max}
            onClick={() => onChange(value + 1)}
            className={`${stepButton} bg-sky-700 text-white`}
          >
            +
          </button>
        </div>
      </div>
      <input
        id="leave-days-range"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-sky-700"
      />
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </section>
  )
}
