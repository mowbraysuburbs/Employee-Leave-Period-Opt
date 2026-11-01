// The round "?" button in the header that opens How it works.
export function HelpButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="How it works"
      title="How it works"
      onClick={onClick}
      className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 text-[15px] font-bold hover:border-slate-400 inline-flex items-center justify-center"
    >
      ?
    </button>
  )
}
