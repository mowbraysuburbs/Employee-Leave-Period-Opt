import { fmtNice } from '../../../utils/dateFormat'

// Public holidays the ticked periods cover, by name.
export function PlanHolidays({ holidays }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Public holidays covered
      </span>
      {holidays.length === 0 ? (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          None yet. Periods around public holidays stretch your leave further.
        </span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {holidays.map(({ date, name }) => (
            <span
              key={date}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-[11px] text-slate-800 dark:text-slate-100 whitespace-nowrap"
            >
              {name}
              <span className="text-slate-500 dark:text-slate-400">{fmtNice(date)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
