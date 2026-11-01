import { BottomSheet } from './BottomSheet'

const SIZES = [
  { id: 'large', label: 'Large', note: '1 month per row', months: 1 },
  { id: 'compact', label: 'Compact', note: '2 months per row', months: 2 },
]

const THEMES = [
  { id: 'light', label: '☀ Light' },
  { id: 'dark', label: '☾ Dark' },
]

// A tiny month of dots, so each size option previews how it looks.
function MiniMonth({ dot }) {
  return (
    <span aria-hidden="true" className="grid grid-cols-7 gap-px">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className={`rounded-full ${[3, 4, 5, 6, 10, 11, 12].includes(i) ? 'bg-teal-500' : 'bg-slate-200'}`} style={{ width: dot, height: dot }} />
      ))}
    </span>
  )
}

/**
 * Phone settings: calendar size and light/dark appearance, both remembered.
 *
 * Props: calendarSize, onCalendarSizeChange, theme, onThemeChange, onClose
 */
export function SettingsSheet({ calendarSize, onCalendarSizeChange, theme, onThemeChange, onClose }) {
  return (
    <BottomSheet label="Settings" title="Settings" backdrop onClose={onClose}>
      <div className="flex flex-col gap-5 pt-1">
        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-[13px] font-bold">Calendar size</h3>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map(s => {
              const on = calendarSize === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onCalendarSizeChange(s.id)}
                  className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center gap-1 ${on ? 'bg-sky-50 border-sky-700' : 'bg-white border-slate-200'}`}
                >
                  <span className="flex gap-1.5 h-[22px] items-center">
                    {Array.from({ length: s.months }, (_, i) => <MiniMonth key={i} dot={s.months === 1 ? 7 : 4} />)}
                  </span>
                  <span className="text-[13px] font-extrabold">{s.label}</span>
                  <span className="text-[11px] text-slate-600">{s.note}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-[13px] font-bold">Appearance</h3>
          <div role="group" aria-label="Appearance" className="flex p-[3px] rounded-xl bg-slate-100">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                aria-pressed={theme === t.id}
                onClick={() => onThemeChange(t.id)}
                className={`flex-1 h-9 rounded-lg text-[13px] font-bold ${theme === t.id ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </BottomSheet>
  )
}
