import { UpNextCard } from './UpNextCard'
import { MoreOptionsTable } from './MoreOptionsTable'
import { OverviewSummary } from './OverviewSummary'
import { YearSwitch } from '../YearSwitch'

const stepButton = 'w-9 h-9 rounded-full text-xl font-semibold leading-none disabled:opacity-40'

/**
 * The page the desktop app opens on: the next big break featured, the other
 * quick picks in a table, and what's already saved for the year.
 *
 * Props:
 *   picks                      – computeQuickPicks() result
 *   year, years, onYearChange  – plan year and its options
 *   leaveDays, maxLeave, onLeaveDaysChange
 *   isSaved                    – (break) => bool
 *   onAdd                      – (breaks) => void
 *   onView                     – (pickId) => void; opens the calendar preview
 *   yearBreaks, allowance      – saved breaks starting in `year`
 *   onOpenCalendar
 */
export function OverviewPage({
  picks,
  year,
  years,
  onYearChange,
  leaveDays,
  maxLeave,
  onLeaveDaysChange,
  isSaved,
  onAdd,
  onView,
  yearBreaks,
  allowance,
  onOpenCalendar,
}) {
  const options = [
    { id: 'max', title: `Maximise leave · ${year}`, breaks: picks.maxLeave ? [picks.maxLeave] : [] },
    { id: 'six', title: 'Next 6 months', breaks: picks.sixMonths ? [picks.sixMonths] : [] },
    { id: 'year', title: `Year plan · ${year}`, breaks: picks.yearPlan },
  ].filter(o => o.breaks.length > 0)

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-[560px]">
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-tight">Your best breaks for {year}</h1>
          <p className="m-0 mt-2 text-base text-slate-600">
            Ready-made options worked out from South African public holidays. Add one, or open it on the calendar for the full picture.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2.5 bg-white border-2 border-sky-700 rounded-2xl px-3 py-2">
            <span className="text-sm font-bold">Leave days</span>
            <button type="button" aria-label="Fewer leave days" disabled={leaveDays <= 1} onClick={() => onLeaveDaysChange(leaveDays - 1)} className={`${stepButton} bg-slate-200`}>−</button>
            <span className="min-w-7 text-center text-2xl font-extrabold">{leaveDays}</span>
            <button type="button" aria-label="More leave days" disabled={leaveDays >= maxLeave} onClick={() => onLeaveDaysChange(leaveDays + 1)} className={`${stepButton} bg-sky-700 text-white`}>+</button>
          </div>
          <YearSwitch years={years} value={year} onChange={onYearChange} />
        </div>
      </section>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="flex-[999_1_640px] min-w-0 flex flex-col gap-4">
          {picks.nextBig && (
            <UpNextCard
              holiday={picks.nextBig.holiday}
              brk={picks.nextBig.brk}
              isSaved={isSaved(picks.nextBig.brk)}
              onAdd={() => onAdd([picks.nextBig.brk])}
              onView={() => onView('next')}
            />
          )}
          <h2 className="m-0 mt-2 text-lg font-extrabold">More options</h2>
          <MoreOptionsTable options={options} isSaved={isSaved} onAdd={onAdd} onView={onView} />
        </div>
        <OverviewSummary year={year} allowance={allowance} breaks={yearBreaks} onOpenCalendar={onOpenCalendar} />
      </div>
    </>
  )
}
