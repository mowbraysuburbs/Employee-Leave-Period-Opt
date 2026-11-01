import { getColourForDaysOff } from '../../utils/colorScale'

const CHIPS = [4, 5, 6, 7, 8, 9, 10]
const BAND_DAYS = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
const EDGE = 'var(--color-slate-900, #0f172a)'

// A joined band of squares for 23–27, like a tapped break on the calendar.
function bandStyle(day) {
  if (day < 23 || day > 27) return {}
  const left = day === 23 || day === 27
  const right = day === 26 || day === 27
  const shadows = [`0 -2px 0 ${EDGE}`, `0 2px 0 ${EDGE}`]
  if (left) shadows.push(`-2px 0 0 ${EDGE}`)
  if (right) shadows.push(`2px 0 0 ${EDGE}`)
  return {
    backgroundColor: getColourForDaysOff(5),
    color: '#0f172a',
    borderRadius: `${left ? 8 : 0}px ${right ? 8 : 0}px ${right ? 8 : 0}px ${left ? 8 : 0}px`,
    boxShadow: shadows.join(', '),
  }
}

// The small illustration on each walkthrough card (step is 0–3).
export function StepPicture({ step }) {
  return (
    <div aria-hidden="true" className="h-[150px] rounded-2xl bg-sky-50 flex items-center justify-center px-3">
      {step === 0 && (
        <div className="h-[54px] pl-[18px] pr-2 rounded-full bg-white shadow-md flex items-center gap-3">
          <span className="text-[15px] font-bold">Leave</span>
          <span className="w-[38px] h-[38px] rounded-full bg-slate-200 flex items-center justify-center text-xl">−</span>
          <span className="text-[28px] font-extrabold">3</span>
          <span className="w-[38px] h-[38px] rounded-full bg-sky-700 text-white flex items-center justify-center text-xl">+</span>
        </div>
      )}
      {step === 1 && (
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex gap-1.5">
            {CHIPS.map(v => (
              <span key={v} className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-extrabold text-slate-900" style={{ backgroundColor: getColourForDaysOff(v), color: '#0f172a' }}>{v}</span>
            ))}
          </div>
          <div className="w-full flex justify-between text-[11px] font-semibold text-slate-600">
            <span>fewer days off</span><span>more days off →</span>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="grid grid-cols-7 w-[238px] gap-y-1">
          {BAND_DAYS.map(d => {
            const inBand = d >= 23 && d <= 27
            return (
              <span key={d} className={`h-8 flex items-center justify-center text-[13px] font-bold ${inBand ? '' : 'mx-0.5 rounded-full bg-sky-100'}`} style={bandStyle(d)}>{d}</span>
            )
          })}
        </div>
      )}
      {step === 3 && (
        <div className="w-[230px] flex flex-col gap-2">
          <span className="h-[42px] rounded-xl bg-sky-700 text-white flex items-center justify-center text-sm font-bold">+ Add to my breaks</span>
          <span className="h-[42px] rounded-full bg-slate-900 text-white flex flex-col items-center justify-center text-[13px] font-bold leading-tight">
            My breaks<span className="text-[11px] font-semibold opacity-75">2 · 15 days off</span>
          </span>
        </div>
      )}
    </div>
  )
}
