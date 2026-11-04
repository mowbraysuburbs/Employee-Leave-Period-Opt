# Journey tests

Small scripts that click through the site like a visitor and check it still works.
They are not part of the website.

1. Start the site: `npm run dev` (it must be on http://localhost:5173, or set `BASE_URL`).
2. In another terminal: `npm run test:e2e`.

Each file prints `PASS` / `FAIL` lines; `run.cjs` adds them up and fails if any check fails.

| File | Checks |
|---|---|
| `phone-calendar.cjs` | Phone Calendar panel: swipe strip, limit, "N left" hold-to-snap, colour chips and ✕, quick filters, hold Filters to clear, More filters, day sheet, tour (390 and 360 wide) |
| `zero-left.cjs` | 0 days left: public-holidays-only view (phone and desktop), and the date range |
| `dates.cjs` | Start / End move independently, within the last date (desktop, Overview, phone) |
| `desktop-tours.cjs` | Desktop first-visit tours (Overview and Calendar), How it works diagrams, replay |

Dates are worked out from today, so the tests keep working as time moves on.
