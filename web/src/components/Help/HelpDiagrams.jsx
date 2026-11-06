import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'

// Small pictures for How it works (desktop). Plain boxes, so they follow the
// light / dark palette like the rest of the page.

const BREAK = [
  ['Sat', 'weekend'], ['Sun', 'weekend'], ['Mon', 'leave'], ['Tue', 'leave'], ['Wed', 'leave'],
  ['Thu', 'public_holiday'], ['Fri', 'public_holiday'], ['Sat', 'weekend'], ['Sun', 'weekend'],
]

/** How a break adds up: 3 leave days next to holidays and weekends = 9 days off. */
export function BreakDiagram() {
  return (
    <figure className="m-0 flex flex-col gap-1.5" aria-label="Example: 3 leave days give 9 days off">
      <div className="flex gap-[3px]">
        {BREAK.map(([day, type], i) => (
          <span
            key={i}
            className="flex-1 h-9 rounded-md flex items-center justify-center text-[11px] font-bold"
            style={{ backgroundColor: DAY_TYPE_COLOUR[type], color: type === 'weekend' ? '#ffffff' : '#0f172a' }}
          >
            {day}
          </span>
        ))}
      </div>
      <figcaption className="text-[12.5px] text-slate-600">
        <b className="text-sky-800">3 leave</b> + <b className="text-green-800">6 free</b> (weekends and Christmas / Day of Goodwill) = <b className="text-indigo-800">9 days off</b>, a <b className="text-amber-800">3.00</b> multiplier.
      </figcaption>
    </figure>
  )
}

const box = 'rounded-md border border-slate-300 bg-white flex flex-col items-center justify-center text-center text-[10.5px] font-bold text-slate-700 leading-tight p-1'
const num = 'inline-flex w-4 h-4 rounded-full bg-slate-900 text-white text-[9.5px] items-center justify-center mb-0.5'

/** The Overview's layout with the three steps numbered. */
export function OverviewDiagram() {
  return (
    <figure className="m-0 flex flex-col gap-1.5" aria-label="The Overview layout">
      <div className="h-[132px] p-1.5 rounded-xl bg-slate-100 grid grid-cols-[74px_1fr_82px] gap-1.5">
        <div className={box}><span className={num}>1</span>Leave periods<br /><span className="font-medium text-slate-500">Custom dates on top</span></div>
        <div className="grid grid-rows-[34px_1fr] gap-1.5">
          <div className={`${box} flex-row gap-2`}><span><span className={num}>2</span> Days off limit · REC</span></div>
          <div className={box}>Your plan: the breaks<br /><span className="font-medium text-slate-500">untick any, then Add to summary</span></div>
        </div>
        <div className={box}>Details<br /><span className="font-medium text-slate-500">stats + calendar</span><span className="mt-1">Summary</span></div>
      </div>
    </figure>
  )
}

/** The Calendar's layout: controls on the left, the months, Details / Summary on the right. */
export function CalendarDiagram() {
  return (
    <figure className="m-0 flex flex-col gap-1.5" aria-label="The Calendar layout">
      <div className="h-[132px] p-1.5 rounded-xl bg-slate-100 grid grid-cols-[74px_1fr_82px] gap-1.5">
        <div className="grid grid-rows-4 gap-1">
          {['Leave days', 'Colours', 'Dates', 'Show'].map(t => <div key={t} className={box}>{t}</div>)}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-md bg-white border border-slate-300 p-1 grid grid-cols-7 gap-[2px] content-start">
              {Array.from({ length: 14 }, (_, d) => (
                <span key={d} className="h-[7px] rounded-full" style={{ backgroundColor: ['#06B6D4', '#14B8A6', '#10B981', '#22C55E', '#EAB308'][(d + i) % 5], opacity: d % 7 === 2 ? 0.25 : 1 }} />
              ))}
            </div>
          ))}
        </div>
        <div className={box}>Details<br /><span className="font-medium text-slate-500">the date you clicked</span><span className="mt-1">Summary</span></div>
      </div>
      <figcaption className="text-[12px] text-slate-500">Both side columns collapse to icons for a bigger calendar.</figcaption>
    </figure>
  )
}
