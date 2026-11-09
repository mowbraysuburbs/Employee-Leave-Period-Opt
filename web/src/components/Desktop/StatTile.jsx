const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function BriefcaseIcon({ size }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function GiftIcon({ size }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function CalendarIcon({ size }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function SuitcaseIcon({ size }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <line x1="9" y1="11" x2="9" y2="16" />
      <line x1="15" y1="11" x2="15" y2="16" />
    </svg>
  )
}

function TrendUpIcon({ size }) {
  return (
    <svg width={size} height={size} {...svgProps}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

// One colour + icon per stat, shared by the hover card and its key so the
// two can never drift apart. The multiplier is a plain number (e.g. 2.50) with a
// trending-up icon, its value one size smaller so both fit.
const KINDS = {
  leave: { className: 'bg-sky-100 text-sky-800', Icon: BriefcaseIcon },
  free: { className: 'bg-green-100 text-green-800', Icon: GiftIcon },
  total: { className: 'bg-indigo-100 text-indigo-800', Icon: CalendarIcon },
  multiplier: { className: 'bg-amber-100 text-amber-800', Icon: TrendUpIcon, small: true },
  breaks: { className: 'bg-slate-100 text-slate-700', Icon: SuitcaseIcon },
}

/**
 * Props:
 *   kind    – 'leave' | 'free' | 'total' | 'multiplier'
 *   value   – shown in the tile (number or text)
 *   label   – optional text after the value (used by the key, not the card)
 *   caption – optional word under the value (the Details stats)
 *   compact – with caption: tighter, one-line caption (four tiles in one row)
 *   stacked – icon over the value, for the collapsed side panel (a button when onClick is given)
 *   title   – tooltip / accessible description
 */
export function StatTile({ kind, value, label, caption, compact = false, stacked = false, title, onClick }) {
  const { className, Icon, small } = KINDS[kind]
  if (stacked) {
    return (
      <button type="button" title={title} aria-label={title} onClick={onClick} className={`w-11 py-1.5 rounded-[10px] flex flex-col items-center gap-0.5 ${className}`}>
        <Icon size={15} />
        <span className="text-[11px] font-extrabold leading-none">{value}</span>
      </button>
    )
  }
  if (caption) {
    return (
      <div className={`flex flex-col items-center gap-px rounded-[10px] ${compact ? 'px-1 py-1.5' : 'px-2 py-1.5'} ${className}`}>
        <span className={`flex items-center gap-1 font-extrabold ${compact ? 'text-[15px]' : 'text-base'}`}>
          <Icon size={compact ? 13 : 14} />
          {value}
        </span>
        <span className={`font-semibold opacity-85 ${compact ? 'text-[10.5px] whitespace-nowrap' : 'text-[11px]'}`}>{caption}</span>
      </div>
    )
  }
  return (
    <span
      className={[
        'inline-flex items-center justify-center gap-1 rounded-lg font-extrabold',
        label ? 'h-[26px] px-2 text-xs font-semibold' : `h-7 ${small ? 'text-[12.5px]' : 'text-sm'}`,
        className,
      ].join(' ')}
    >
      {Icon && <Icon size={label ? 12 : 13} />}
      {value}
      {label && <span>{label}</span>}
    </span>
  )
}
