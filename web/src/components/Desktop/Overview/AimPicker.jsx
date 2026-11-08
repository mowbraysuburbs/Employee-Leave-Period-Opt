import { StepHeading } from './StepHeading'

const AIMS = [
  { id: 'max', label: 'Holiday breaks', title: 'Short breaks around each holiday, best value first: tick the ones you want' },
  { id: 'long', label: 'One long break', title: 'Your leave days in one go, longest first: pick one' },
]

/**
 * Step 3 of the Overview, for Custom dates only, when its holidays are too far
 * apart to join: holiday breaks or one long break.
 *
 * Props: value ('long' | 'max'), onChange, phone
 */
export function AimPicker({ value, onChange, phone = false }) {
  return (
    <div data-tour="aim" className={phone ? 'flex flex-col gap-2' : 'flex items-center gap-2'}>
      <StepHeading phone={phone} number={3}>Show</StepHeading>
      <div role="radiogroup" aria-label="Show which list" className="flex p-0.5 rounded-xl bg-slate-100 text-[12.5px] font-bold">
        {AIMS.map(a => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={value === a.id}
            title={a.title}
            onClick={() => onChange(a.id)}
            className={`${phone ? 'flex-1 h-10 px-3' : 'h-8 px-2.5'} rounded-[10px] whitespace-nowrap ${value === a.id ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
