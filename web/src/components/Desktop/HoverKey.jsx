import { StatTile } from './StatTile'

// Legend for the hover card's tiles, in the same order as the card.
export function HoverKey({ colourBy }) {
  const total = <StatTile key="total" kind="total" label="total off" />
  const multiplier = <StatTile key="multiplier" kind="multiplier" value="×" label="multiplier" />

  return (
    <div aria-label="Hover card key" className="flex-[1_1_300px] flex flex-wrap justify-end items-center gap-1.5">
      <StatTile kind="leave" label="leave" />
      <StatTile kind="free" label="free days" />
      {colourBy === 'multiplier' ? [total, multiplier] : [multiplier, total]}
    </div>
  )
}
