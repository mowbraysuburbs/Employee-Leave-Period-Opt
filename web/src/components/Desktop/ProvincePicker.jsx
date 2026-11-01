import { PROVINCES } from '../../data/schoolHolidays'

/**
 * Province dropdown for school holidays. One province is shared by School
 * run on the Overview and the calendar's school filter.
 */
export function ProvincePicker({ value, onChange }) {
  return (
    <div className="inline-flex flex-col gap-1.5 px-3.5 py-3 bg-white border border-sky-200 rounded-2xl">
      <label htmlFor="school-province" className="text-xs font-bold text-sky-800 uppercase tracking-wide">Your province</label>
      <select
        id="school-province"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-[38px] min-w-[220px] border border-slate-300 rounded-[10px] px-2.5 text-sm font-semibold bg-white"
      >
        {PROVINCES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
      </select>
    </div>
  )
}
