import { PROVINCES } from '../../data/schoolHolidays'

/**
 * Province dropdown for school holidays. One province is shared by School
 * run on the Overview and the calendar's school filter.
 *
 * Props:
 *   value, onChange – province code
 *   compact         – slim version for the calendar's control rail
 *   id              – keeps the label/select pair unique on each page
 */
export function ProvincePicker({ value, onChange, compact = false, id = 'school-province' }) {
  const select = (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`border border-slate-300 bg-white font-semibold ${compact ? 'w-full h-8 rounded-lg px-2 text-[13px]' : 'h-[38px] min-w-[220px] rounded-[10px] px-2.5 text-sm'}`}
    >
      {PROVINCES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
    </select>
  )

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">School province</label>
        {select}
      </div>
    )
  }

  return (
    <div className="inline-flex flex-col gap-1.5 px-3.5 py-3 bg-white border border-sky-200 rounded-2xl">
      <label htmlFor={id} className="text-xs font-bold text-sky-800 uppercase tracking-wide">Your province</label>
      {select}
    </div>
  )
}
