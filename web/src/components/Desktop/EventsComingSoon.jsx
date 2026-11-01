import { PlanIcon } from './Overview/PlanIcon'

const POINTS = [
  'Concerts, festivals, sport and markets that fall inside your breaks',
  'Filter by your city or province',
  'Add an event to the same break you are planning leave for',
]

/**
 * Placeholder for the planned events feature (event listings, e.g. from
 * Quicket, matched to leave breaks). Used as the Events page and as the
 * Overview's Events panel.
 *
 * Props:
 *   variant – 'page' (full Events tab) | 'panel' (Overview details panel)
 */
export function EventsComingSoon({ variant = 'panel' }) {
  const isPage = variant === 'page'

  return (
    <article
      aria-label="Events, coming soon"
      className={[
        'min-w-0 bg-white rounded-[20px] shadow-sm border border-teal-200 flex flex-col gap-4',
        isPage ? 'max-w-[720px] mx-auto mt-6 p-8 items-center text-center' : 'flex-[999_1_480px] p-[22px]',
      ].join(' ')}
    >
      <PlanIcon kind="events" size={isPage ? 56 : 40} />
      <div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">Coming soon</span>
        <h2 className={`m-0 mt-2 font-extrabold tracking-tight ${isPage ? 'text-3xl' : 'text-[22px]'}`}>Events that fit your breaks</h2>
        <p className="m-0 mt-2 text-sm text-slate-600 leading-relaxed max-w-[560px]">
          Soon you'll be able to see what's on while you're off: we'll match event listings to the leave breaks you plan, so you can book the time and the tickets together.
        </p>
      </div>
      <ul className={`m-0 p-0 list-none flex flex-col gap-2 text-sm text-slate-700 ${isPage ? 'items-start text-left' : ''}`}>
        {POINTS.map(point => (
          <li key={point} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-teal-600" />
            {point}
          </li>
        ))}
      </ul>
    </article>
  )
}
