# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Teaching Mode

The user is actively learning web development. **Before every code change, explain in plain English:**
- What you are about to do and why
- What the key concept or pattern is (e.g. "this is a React hook — it lets a component remember a value between renders")
- What to watch out for or what could go wrong

Keep explanations concise — one short paragraph per change is enough.

---

## Project Overview

A mobile-first React web app for South African employees to find optimal leave periods. The core idea: for every day of the year, calculate how many total days off you would get if you started leave on that day. Render this as a colour-coded calendar heatmap.

**Stack:**
- **React + Vite** — component-based UI with fast dev server
- **Tailwind CSS (v4, via `@tailwindcss/vite`)** — utility-first styling, no separate config file needed
- **JavaScript (not TypeScript)** — keep it simple
- **Supabase** — planned for email reminders (not yet integrated)

---

## Project Structure

```
src/
  components/
    Desktop/      # Desktop layout (≥640px): year calendar, hover card, break details, My breaks
      Overview/   # Landing page: plan list (left) + themed plan details with tick boxes (right)
      Rail/       # Calendar control rail (expanded / collapsed to icons)
    Mobile/       # Phone layout (<640px): calendar, bottom panel, day / Filters / My breaks sheets
    Features/     # HolidaysList (used by both layouts)
  hooks/
    useLeavePlanner.js  # Planning state shared by DesktopApp and MobileApp
  data/
    publicHolidays.js   # Hardcoded SA public holidays 2025–2026
    schoolHolidays.js   # SA school term breaks by province
  utils/
    leaveCalculator.js  # Core algorithm — JS port of the Python notebook
    breaks.js           # Break building, equal starts, combining overlaps
    calendarDays.js     # Day cells (colours, bands) for both calendars
    colorScale.js       # Maps days-off count → distinct colour
    shareCard.js        # Canvas share image + Web Share (kept for the parked Share feature)
  App.jsx               # Picks DesktopApp or MobileApp by screen width
  main.jsx
  index.css
```

---

## Coding Conventions

### React Components
- One component per file, filename matches the component name (PascalCase): `DayCell.jsx`
- Use **function components** only — no class components
- Use **named exports**, not default exports: `export function DayCell() {}`
- Props go on separate lines when there are more than two
- Keep components small — if JSX exceeds ~60 lines, split it

### State Management
- Use `useState` for local UI state (selected leave days, active tab, etc.)
- Use `useMemo` to cache expensive computations (leave scores are recalculated on year/leave-day change)
- No external state library — React built-ins are sufficient for this project

### Tailwind CSS
- **Mobile-first**: base styles target mobile, use `md:` and `lg:` prefixes for larger screens
- Avoid inline `style={{}}` unless Tailwind cannot express it (e.g. dynamic hex colours for the heatmap cells)
- Keep class strings readable — break long ones across lines using template literals or arrays

### Data & Utils
- Pure functions only in `utils/` — no side effects, no React imports
- Date strings are always `YYYY-MM-DD` format throughout the app
- Never mutate arrays/objects — always return new ones

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `MonthGrid.jsx` |
| Utils / data | camelCase | `leaveCalculator.js` |
| CSS | kebab-case | `index.css` |

---

## Key Algorithms

### Leave Calculator (`utils/leaveCalculator.js`)
For each day `D` in the year:
1. Start a counter `totalDaysOff = 0`, `leaveCredits = N`
2. Walk forward day by day from `D`
3. If the day is a weekend or public holiday → `totalDaysOff++` (free)
4. If the day is a workday → spend one leave credit, `totalDaysOff++`
5. When credits hit -1, stop. Record `totalDaysOff` for date `D`

Returns an array of 365/366 scores, one per calendar day.

### Colour Scale (`utils/colorScale.js`)
- Each distinct `totalDaysOff` value maps to a unique colour from a categorical palette
- The palette is perceptually distinct (not a gradient) so each value is clearly different
- Colourblind-safe: based on the Okabe-Ito palette extended with additional hues

---

## Design Decisions

- **No external heatmap library** — custom cell rendering gives full control over colours, dots, tooltips, and mobile layout
- **Vertical month scroll on mobile** — one month per row, 7-column grid; controls in a bottom panel, details in bottom sheets
- **White bold text on holiday cells** — makes public holidays immediately visible without a separate legend
- **Bottom tab bar on mobile, top tabs + control rail on desktop**
