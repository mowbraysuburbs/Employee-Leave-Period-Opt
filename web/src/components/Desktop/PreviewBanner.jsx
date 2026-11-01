// Slim bar above the calendar while a quick pick from Overview is previewed.
export function PreviewBanner({ title, onBack, onClear }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sm">
      <span className="flex-auto">Previewing quick pick: <strong>{title}</strong></span>
      <button type="button" onClick={onBack} className="font-bold text-sky-700 hover:text-sky-800">Back to overview</button>
      <button type="button" onClick={onClear} className="h-8 px-3 rounded-lg border border-sky-200 bg-white text-sky-800 text-[13px] font-bold">
        Clear preview
      </button>
    </div>
  )
}
