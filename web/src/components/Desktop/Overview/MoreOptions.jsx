import { ProvincePicker } from '../ProvincePicker'
import { monthLabel } from '../../../utils/planner'
import { fmtShortRange } from '../../../utils/dateFormat'

const MARK_STYLE = {
  avoid: 'bg-red-50 text-red-700 border-red-300',
  include: 'bg-green-100 text-green-800 border-green-300',
}

/**
 * The planner's extra settings: tap a month once to avoid it, twice to make
 * sure a break lands in it, a third time to clear. Custom dates that overlap
 * school holidays also get a "Match school holidays" switch.
 *
 * Props:
 *   planner                    – usePlanner() result
 *   province, onProvinceChange – school province
 *   phone                      – grid sized for the phone sheet
 */
export function MoreOptions({ planner, province, onProvinceChange, phone = false }) {
  const { periodMonths, monthMarks, cycleMonth, clearMonths, schoolSpans, matchSchool, setMatchSchool } = planner
  const twoYears = periodMonths[0].slice(0, 4) !== periodMonths.at(-1).slice(0, 4)
  const anyMarked = periodMonths.some(m => monthMarks[m])

  return (
    <div className={`flex flex-col gap-3 ${phone ? '' : 'px-[22px] py-4 bg-slate-50 border-b border-slate-200'}`}>
      {schoolSpans.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[13px]">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={matchSchool} onChange={e => setMatchSchool(e.target.checked)} className="w-4 h-4 accent-slate-900" />
            Match school holidays
          </label>
          <div className="w-40"><ProvincePicker compact id={phone ? 'phone-planner-province' : 'planner-province'} value={province} onChange={onProvinceChange} /></div>
          <span className="basis-full text-xs text-slate-600">
            Your dates include school holidays ({schoolSpans.map(s => fmtShortRange(s.start, s.end)).join(', ')}). On: breaks stay inside them.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Months to avoid or include</span>
          {anyMarked && <button type="button" onClick={clearMonths} className="text-xs font-bold text-sky-700">Clear months</button>}
        </div>
        <span className="text-xs text-slate-600">
          Tap once <b className="text-red-700">✕ avoid</b> · twice <b className="text-green-800">✓ include</b> (a break must land in it) · again to clear
        </span>
        <div className={`grid gap-1.5 ${phone ? 'grid-cols-4' : 'grid-cols-[repeat(auto-fill,minmax(70px,1fr))]'}`}>
          {periodMonths.map(m => {
            const mark = monthMarks[m]
            const label = monthLabel(m, twoYears)
            return (
              <button
                key={m}
                type="button"
                aria-label={`${label}: ${mark === 'avoid' ? 'avoided' : mark === 'include' ? 'included' : 'no preference'}`}
                onClick={() => cycleMonth(m)}
                className={`h-8 rounded-full border-[1.5px] text-[12.5px] font-bold ${MARK_STYLE[mark] ?? 'bg-white border-slate-300 text-slate-700'}`}
              >
                {label}{mark === 'avoid' ? ' ✕' : mark === 'include' ? ' ✓' : ''}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
