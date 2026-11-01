const DECO = 'absolute pointer-events-none z-0'

/**
 * Faint seasonal decoration in the top-right corner of the details panel.
 * Purely decorative, so it's hidden from screen readers.
 */
export function PlanTheme({ kind }) {
  if (kind === 'xmas') {
    return (
      <svg aria-hidden="true" width="260" height="200" viewBox="0 0 260 200" className={`${DECO} -right-4 -top-3 opacity-20`}>
        <g stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" fill="none">
          <line x1="200" y1="30" x2="200" y2="90" /><line x1="174" y1="45" x2="226" y2="75" /><line x1="174" y1="75" x2="226" y2="45" />
        </g>
        <g stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <line x1="120" y1="20" x2="120" y2="56" /><line x1="104" y1="29" x2="136" y2="47" /><line x1="104" y1="47" x2="136" y2="29" />
          <line x1="160" y1="130" x2="160" y2="156" /><line x1="149" y1="137" x2="171" y2="149" /><line x1="149" y1="149" x2="171" y2="137" />
        </g>
        <path d="M235 120l6 14 15 1-11 10 4 15-14-8-14 8 4-15-11-10 15-1z" fill="#CA8A04" />
      </svg>
    )
  }
  if (kind === 'easter') {
    return (
      <svg aria-hidden="true" width="240" height="190" viewBox="0 0 240 190" className={`${DECO} -right-2.5 -top-1.5 opacity-30`}>
        <ellipse cx="180" cy="70" rx="30" ry="40" fill="#E9D5FF" />
        <path d="M152 66l14-8 14 8 14-8 14 8" stroke="#7E22CE" strokeWidth="3" fill="none" />
        <ellipse cx="120" cy="40" rx="20" ry="27" fill="#BBF7D0" />
        <path d="M101 42l10-6 9 6 10-6 9 6" stroke="#15803D" strokeWidth="2.5" fill="none" />
        <ellipse cx="215" cy="145" rx="18" ry="24" fill="#FDE68A" />
        <circle cx="208" cy="140" r="3" fill="#B45309" /><circle cx="221" cy="150" r="3" fill="#B45309" />
      </svg>
    )
  }
  if (kind === 'school') {
    return (
      <svg aria-hidden="true" width="230" height="180" viewBox="0 0 230 180" className={`${DECO} -right-2.5 -top-1 opacity-20`}>
        <g stroke="#075985" strokeWidth="3" strokeLinejoin="round" fill="none">
          <path d="M120 40l50-22 50 22-50 22z" /><path d="M140 50v26c0 7 13 14 30 14s30-7 30-14V50" />
        </g>
        <g stroke="#0369A1" strokeWidth="3" strokeLinejoin="round" fill="none">
          <rect x="150" y="110" width="60" height="44" rx="4" /><line x1="180" y1="110" x2="180" y2="154" />
        </g>
      </svg>
    )
  }
  if (kind === 'trip') {
    return (
      <svg aria-hidden="true" width="240" height="190" viewBox="0 0 240 190" className={`${DECO} -right-5 -top-5 opacity-25`}>
        <circle cx="180" cy="60" r="34" fill="#FCD34D" />
        <path d="M180 6v10M180 104v10M126 60h10M224 60h10M142 22l7 7M211 91l7 7M142 98l7-7M211 29l7-7" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        <path d="M110 150c15-10 30-10 45 0s30 10 45 0 30-10 45 0" stroke="#0EA5E9" strokeWidth="4" fill="none" />
      </svg>
    )
  }
  if (kind === 'next') {
    return (
      <svg aria-hidden="true" width="220" height="170" viewBox="0 0 220 170" className={`${DECO} -right-2 -top-2 opacity-20`}>
        <path d="M170 20l9 20 22 2-17 14 5 22-19-11-19 11 5-22-17-14 22-2z" fill="#DB2777" />
        <path d="M110 70l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#F472B6" />
        <path d="M195 110l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z" fill="#F9A8D4" />
      </svg>
    )
  }
  return null
}
