const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const PATHS = {
  next: <path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z" />,
  three: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  xmas: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  easter: (
    <>
      <path d="M12 3c-3.6 0-6.5 5.2-6.5 9.6A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-8.4C18.5 8.2 15.6 3 12 3z" />
      <path d="M6 12.5l2.5-1.5 3.5 2 3.5-2 2.5 1.5" />
    </>
  ),
  school: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </>
  ),
  year: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="9 16 11 18 15 14" />
    </>
  ),
  trip: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
}

const COLOURS = {
  next: 'bg-pink-100 text-pink-800',
  three: 'bg-green-100 text-green-800',
  xmas: 'bg-red-100 text-red-800',
  easter: 'bg-purple-100 text-purple-800',
  school: 'bg-sky-100 text-sky-800',
  year: 'bg-indigo-100 text-indigo-800',
  trip: 'bg-amber-100 text-amber-800',
}

// The coloured square icon that identifies each kind of plan.
export function PlanIcon({ kind, size = 34 }) {
  return (
    <span
      className={`shrink-0 rounded-[10px] flex items-center justify-center ${COLOURS[kind]}`}
      style={{ width: size, height: size }}
    >
      <svg width={size / 2} height={size / 2} {...svgProps}>{PATHS[kind]}</svg>
    </span>
  )
}
