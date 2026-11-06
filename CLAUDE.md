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
    Desktop/            # Desktop layout (≥640px wide and ≥500px tall)
      DesktopApp.jsx    # Pages (Overview, Calendar, Public holidays, Events), side panel, collapse state
      YearCalendar.jsx, MonthCard.jsx   # Calendar grid (shared MonthCard with the phone)
      HoverCard.jsx, CalendarKey.jsx    # Hover stats tiles; the Key popover (Overview + Calendar)
      SidePanel.jsx     # Details | Summary tabs (calendar and Overview)
      PanelCollapsed.jsx# Side panel collapsed to a slim strip (mirrors the left rail)
      BreakDetailHead/Panel.jsx, StartDateChips.jsx, BreakWeeks.jsx, BreakDaysTable.jsx  # Details tab
      MyBreaksPanel.jsx, SavedBreaksTable.jsx, CalendarExport.jsx  # Summary tab + Apple/Google export
      LeaveCard.jsx     # Calendar leave card: "5 / 10▾ limit", blocks, Snap to days left switch
      LeaveBlocks.jsx   # Shared LeaveBlocks + LeaveFraction (calendar card and Overview step 2)
      StatTile.jsx      # Coloured stat tiles (leave, free, days off, multiplier, breaks)
      Overview/         # The 3-step planner page
        OverviewPage.jsx, PeriodList.jsx (step 1), PlannerBar.jsx + LimitPicker.jsx (step 2, REC tag), RecLine.jsx (line under the plan title)
        MoreOptions.jsx (Advanced options), PlannerResults.jsx, PlannerTable.jsx, PlanMonths.jsx (calendar view)
      Rail/             # Calendar control rail: RailExpanded / RailCollapsed (icons act directly, pop-outs)
    Mobile/             # Phone layout: MobileApp, MobileCalendar, BottomPanel, BottomSheet, FiltersSheet,
                        # SettingsSheet, MobileOverview, MobileTabBar
    Help/               # GuidedTour (welcome tour), HowItWorks, HelpButton, step texts
    Features/           # HolidaysList (both layouts)
  hooks/
    useLeavePlanner.js  # Planning state shared by DesktopApp and MobileApp (calendar, saved breaks,
                        # leave limit / leave left / Snap, filters, Overview planner via usePlanner)
    usePlanner.js       # Overview planner settings and results
    useSettings.js      # Theme, phone calendar size, leave limit (localStorage)
    useWelcome.js       # First-visit welcome tour flag
  data/
    publicHolidays.js   # SA public holidays 2025–2028 (data runs out after 2028)
    schoolHolidays.js   # SA school holidays by province 2025–2028
  utils/
    leaveCalculator.js  # Core algorithm — JS port of the Python notebook
    breaks.js           # Build a break, equal start dates, combining overlaps, totals
    planner.js          # Overview planner: leave periods + best plan (DP), MAX_LEAVE = 10
    plans.js            # School-holiday helpers (schoolBreaksFor, provinceLabel)
    calendarDays.js     # Day cells for both calendars (colours, bands, saved boxes, row hiding)
    colorScale.js       # Days off / multiplier → colour
    dateFormat.js       # Date labels (incl. short years "Sat 12 Dec '26" and numeric "12–17 / Dec")
    dayTypes.js, calendarExport.js, shareCard.js (parked Share feature)
  App.jsx               # Picks DesktopApp or MobileApp by screen size
```

---

## How the App Works

**Pages:** Overview (the planner, opens first), Calendar, Public holidays, Events (coming soon).

**Leave limit and leave days**
- One **leave limit** for the whole site (1–10, never more than 10 — `MAX_LEAVE` in `utils/planner.js`), saved in settings.
- **Leave left** = limit − leave in the Summary.
- Leave days are shown as **"5 / 10▾ limit"** (the limit is a dropdown) with **numbered blocks**, one per day up to the limit.
- **📍 Snap to days left** is one on/off switch: on = the calendar uses the leave left; picking a block turns it off (exploring is allowed past what's left, with a note).

**Calendar page**
- Colours show days off (or the multiplier) if leave starts that day.
- Click a day: its break gets a grey pill and opens in Details; saved breaks become joined rectangles with white numbers and a start dot.
- Left rail and right Details | Summary panel both collapse to slim strips ("Collapse to icons"); collapsed icons act directly (toggles, pop-outs for leave days and dates).
- Days-off and public-holiday filters hide whole rows of months with no match (rows stay whole at 2–4 columns).

**Overview planner (2 steps, no aim to pick)**
1. Pick a leave period: Custom, or themed cards (Up next, Christmas holidays, Easter, School holidays, next year). Each card shows its plan in 2×2 stat tiles.
2. Days off limit (numbers 1–10; the period's recommended number is tagged **REC**).
- The leave days decide the plan: with the REC number or more → **one long break** joining the period's holidays (school holidays: covering the whole school holiday when that's ≤ 10 days); fewer, or no REC (next year, Custom) → **best multiplier**. A line under the plan title always says which (💡 suggestion with **Use N**, ✓ long break, 📈 best multiplier).
- Breaks never run past the period's end and are **at least one working week apart**.
- Advanced options: plan around school holidays; months to avoid / include.
- Results table (Start / End with short years, a dropdown for equal start dates), Add / Export, and the same Details | Summary panel as the calendar.

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

### Overview Planner (`utils/planner.js`)
- Candidate breaks: every start day in the period (the day after a workday, so equal starts collapse) with 1..N leave days, never past the period's end.
- Dynamic programming picks the most days off within the leave budget and a maximum number of breaks, with breaks at least 5 workdays apart; months can be avoided or required.
- `recommendedLeave(period)`: the fewest leave days whose single longest break joins the most public holidays (best multiplier on a tie); `breaksFor(rec, leave)` = 1 break at or above it, else as many as help.

### Colour Scale (`utils/colorScale.js`)
- Each distinct `totalDaysOff` value maps to a unique colour from a categorical palette
- The palette is perceptually distinct (not a gradient) so each value is clearly different
- Colourblind-safe: based on the Okabe-Ito palette extended with additional hues

---

## Design Decisions

- **No external heatmap library** — custom cell rendering gives full control over colours, dots, tooltips, and mobile layout
- **One screen tall on desktop** — Calendar and Overview fit the window; columns scroll on their own
- **Both side columns collapse the same way** — matching "Collapse to icons" bars and slim icon strips
- **Phone: bottom panel + sheets** — controls within thumb reach; Overview has a colourful period strip above the tabs
- **Dark mode** swaps the palette variables in `index.css` rather than adding `dark:` classes everywhere
- **Nothing hard-coded past 10 leave days**

---

## Workflow

- Mock new designs first (Claude Design canvas), then build.
- One branch per change; squash-merge PRs only when the user says "merge".
- Check changes in the browser (Playwright) on desktop (1280×800) and phones (390×844, 360×740); there's no unit test suite.
