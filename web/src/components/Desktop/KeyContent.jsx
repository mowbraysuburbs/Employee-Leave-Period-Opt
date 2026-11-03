import { StatTile } from './StatTile'
import { DAY_TYPE_LEGEND } from '../../utils/dayTypes'

function Row({ marker, children }) {
  return (
    <li className="flex items-center gap-2.5 text-[13px] text-slate-700">
      <span className="w-[30px] shrink-0 flex justify-center">{marker}</span>
      <span>{children}</span>
    </li>
  )
}

/**
 * What the colours, tiles and marks mean: shared by the desktop Key popover
 * and the phone's Help sheet (Key tab).
 */
export function KeyContent() {
  return (
    <>
      <section>
        <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Reading the hover card</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile kind="leave" value={10} caption="leave days" />
          <StatTile kind="free" value="+9" caption="free days" />
          <StatTile kind="total" value={19} caption="days off" />
          <StatTile kind="multiplier" value="1.90" caption="multiplier" />
        </div>
        {/* A worked example, so the multiplier isn't a mystery. */}
        <div className="mt-2.5 px-3 py-2.5 rounded-xl bg-slate-50 text-[13px] leading-relaxed">
          <div><b className="text-sky-800">10 leave</b> + <b className="text-green-800">9 free</b> = <b className="text-indigo-800">19 days off</b></div>
          <div><b className="text-indigo-800">19</b> ÷ <b className="text-sky-800">10</b> = <b className="text-amber-800">1.90</b> days off per leave day</div>
          <div className="mt-1 text-xs text-slate-500 leading-snug">Free days are weekends and public holidays. A higher multiplier means your leave goes further.</div>
        </div>
      </section>

      <section>
        <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Days in a break</h3>
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {DAY_TYPE_LEGEND.map(l => (
            <Row key={l.type} marker={<span className="w-4 h-4 rounded" style={{ backgroundColor: l.colour }} />}>{l.label}</Row>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">On the calendar</h3>
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          <Row marker={<span className="w-6 h-6 rounded-full bg-teal-500" />}>Colour = days off if leave starts that day</Row>
          <Row marker={<span className="relative w-6 h-6 rounded-full bg-amber-500"><span className="absolute bottom-0.5 left-1/2 -ml-0.5 w-1 h-1 rounded-full bg-slate-900" /></span>}>Dot = public holiday</Row>
          <Row marker={<span className="w-6 h-6 rounded-full bg-transparent text-slate-500 text-xs font-semibold flex items-center justify-center">4</span>}>Not coloured: leave here gets no free days</Row>
          <Row marker={<span className="w-6 h-6 rounded-full bg-teal-500 outline-2 outline-offset-2 outline-sky-600" />}>Today</Row>
          <Row marker={<span className="relative w-6 h-6 rounded-full bg-slate-300"><span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-slate-500" /></span>}>Grey = the break you clicked (dot = first day)</Row>
          <Row marker={<span className="relative w-7 h-6 rounded-md bg-teal-500 text-white text-xs font-semibold flex items-center justify-center">12<span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.3)]" /></span>}>Rectangles, white numbers = a break in your Summary</Row>
          <Row marker={<span className="w-[26px] h-1 rounded-sm bg-green-600" />}>School holiday (when that filter is on)</Row>
        </ul>
      </section>
    </>
  )
}
