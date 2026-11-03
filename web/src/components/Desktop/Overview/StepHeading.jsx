/**
 * A planner step's heading: a black numbered circle, the question, and an
 * optional small note.
 *
 * Props: number, children (the title), note, phone, htmlFor (labels a control)
 */
export function StepHeading({ number, children, note, phone = false, htmlFor }) {
  const Tag = htmlFor ? 'label' : 'h2'
  return (
    <Tag htmlFor={htmlFor} className="m-0 flex items-center gap-2">
      <span className={`shrink-0 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center ${phone ? 'w-5 h-5 text-[11px]' : 'w-[26px] h-[26px] text-[13px]'}`}>{number}</span>
      <span className={`font-extrabold whitespace-nowrap ${phone ? 'text-[13px]' : 'text-[15px]'}`}>{children}</span>
      {note && <span className="text-xs font-medium text-slate-500">{note}</span>}
    </Tag>
  )
}
