import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'

// A thin bar of coloured segments, one per day in a break, so leave vs free
// days read at a glance without any words.
export function DayStrip({ days, height = 8 }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {days.map(d => (
        <div
          key={d.date}
          className="flex-1 rounded-sm"
          style={{ height, backgroundColor: DAY_TYPE_COLOUR[d.type] }}
        />
      ))}
    </div>
  )
}
