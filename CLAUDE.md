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
        MoreOptions.jsx (Advanced options), PlannerResults.jsx, PlannerTable.jsx, PlanMonths.jsx (calendar view; months a break crosses are joined, the 1st shows "1 Apr")
        PeriodMonths.jsx (Custom From / To months), CustomOptionsTable.jsx + OptionRow.jsx (the two-section list), StartCell.jsx (equal-start dropdown, both tables)
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
- **Dates are whole months** (From / To dropdowns, like the Overview's Custom card; `PeriodPicker`, `monthPeriod` in `utils/dateFormat.js`): From starts on the 1st (this month: today), To ends on the month's last day (capped at the last date); the other moves along so From ≤ To. Same in the collapsed rail's pop-out and the phone's More filters.
- Left rail and right Details | Summary panel both collapse to slim strips ("Collapse to icons"); collapsed icons act directly (toggles, pop-outs for leave days and dates).
- Days-off and public-holiday filters hide whole rows of months with no match (rows stay whole at 2–4 columns). The holidays filter reads "Public holidays: All" when every holiday is ticked.
- **Leave fills a gap** (Show on the rail, More filters on the phone; `fillsGap` in `utils/breaks.js`): only breaks where the day before the first leave day and the day after the last are free (weekend or holiday), so the leave joins two free stretches instead of padding one long weekend. December 2026: 2 days → Reconciliation (12–17); 4 days → 12–20, 19–27 and 25 Dec – 3 Jan.

**Overview planner (2 steps)**
1. Pick a leave period: Custom, or themed cards (Up next, Christmas holidays, Easter, School holidays, next year). Each card says what it's for (`CARD_DESCRIPTIONS`), then a fixed holiday count (weekday public holidays in the period) and its dates. No stats on the cards: they re-planned with whatever number you were on and showed plans you never saw; the numbers live in the plan's title line and Details.
2. Leave days: **the Calendar's leave card, laid out long** (`OverviewLeaveCard`, phone: top of Plan settings). "N left · M used", the shared "3 / 10▾ limit" fraction (the limit only changes in its dropdown) and blocks 1–10 (`LimitPicker`) that pick **this plan's** leave. Unlike the Calendar, not every number can be picked: past what's left they're locked (dashed, green "N left" line), skipped numbers are struck through, and REC (Up next, School holidays) / MIN / JOINS tag the good ones. Whole limit in the Summary → the list becomes "All N leave days are in your Summary" with Raise my limit / Open Summary. The phone's settings button shows this plan's days and "N left".
- The leave days decide the plan: with the REC number or more → **one long break** joining the period's holidays (school holidays: covering the whole school holiday when that's ≤ 10 days); fewer, or no REC (next year) → **best multiplier**. A line under the plan title always says which (💡 suggestion with **Use N**, ✓ long break, 📈 best multiplier).
- Breaks never run past the period's end and are **at least one working week apart**.
- **Custom dates** is different: whole months (From / To, at least one month; this month only if it has 10+ workdays left), and **nothing is picked until you pick**. The months' weekday holidays (Easter, Christmas + Day of Goodwill count as one) decide the list (`customLeaveMap`, `customListFor`, `customOptions`, `pickBlocker` in `utils/planner.js`):
  - no holidays → one row per week ("every week is the same"); one holiday → longest breaks
  - **long breaks are capped at the best value**: the last join within your leave (or one holiday's proper break). Numbers past it only pad the break, so they're skipped and the line says to use the rest on the Calendar (Easter at 10: 3 joins, 4–10 skipped). One list (`listSections`): joins first, then each holiday's proper break; with no holidays, the weekly long breaks. Every row is a tick box. No step 3.
  - the number row follows **Leave number rules** below (MIN / JOINS tags, skipped numbers struck through and not clickable); colours for the marks are a later branch
  - Holiday breaks = one best-value break per holiday and per join, no plain long weekends, needn't use all the leave; tick any that don't overlap and fit the leave. Columns Start ▾ · End · Holidays used · Days off · Leave days · Multiplier, click a heading to sort.
- **Easter and Christmas holidays** use the same list and table as Custom (`listMode` in usePlanner), and start with **nothing ticked**. No REC tag here: MIN and JOINS show which numbers are worth it (REC stays on Up next and School holidays for now). The line under the title is about the number you're on ("✓ 4 leave days join Christmas + New Year: dates, days off"), no Use N. Rows that clash with a tick (overlap it, or need more leave than is left) are greyed, with one note under the table; nothing is hidden. **Next year** works the same way (several seasons: JOINS on each join, the list = each join and holiday; no padded long breaks). Up next and School holidays still use the plan (planLeave).
- The Details calendar (beside the list) shows **every option's dates** for these list periods: faint unless a ticked break uses them, solid when ticked, and the hovered row's dates glow (one style per date, so overlaps never double up).
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

### Leave number rules (Custom, Easter, Christmas)
What each leave number (1–10) does depends on the holidays in the period and how far apart they are. Terms:
- **Holiday** = a public holiday on a weekday. Holidays with no workday between them count as one (Easter Fri–Mon; Christmas + Day of Goodwill; Fri + next Mon). A holiday on a Saturday gives nothing.
- **MIN (first proper break)** = the first number that makes a real break: a Tue / Thu holiday 1 (take Mon / Fri → 4 days), Wed 2 (→ 5 days), Mon / Fri **4** (the 3-day weekend is free, so the next real break is the full week → 9 days), unless a join comes sooner (Easter '27: join at 3). Saturday holiday: nothing. Several holidays: each one's long weekend adds up. No holidays: 1 (a Fri or Mon → 3 days). Numbers below MIN are skipped; MIN gets a tag.
- **J (join number)** = leave needed to join holidays into one break (the workdays between them). JOINS tag on J.
- **Skipped** = a number that adds nothing new (only pads a break): shown struck through, can't be picked.

| # | Scenario | Numbers 1–10 | List | Example |
|---|---|---|---|---|
| 0 | No holidays | all usable (MIN 1) | one row per week ("every week is the same") | Feb '27 |
| 1 | One holiday | only MIN (its proper break); every other number skipped (capped) | holiday breaks | Aug '27 Women's Day (Mon: skip 1–3, MIN 4 = 9 days) · Jun '27 Youth Day (Wed: skip 1, MIN 2) |
| 2a | Two holidays, J ≤ 10 (about two weeks apart or less) | 1..W usable · W+1..J−1 skipped · J JOINS · J+1..10 one long break | holiday breaks below J, one long break from J | Dec '27: 1 · skip 2–5 · 6 joins (16–27 Dec) |
| 2b | Two holidays, J ≤ W (same week, e.g. Tue + Thu) | no skips, straight to J | as 2a | |
| 2c | Two holidays, both Mon / Fri (long weekends free) | skipped until J or 4, whichever comes first | as 2a | Easter '27: skip 1–2 · 3 joins (20–29 Mar) |
| 2d | Two holidays, J > 10 (more than ~two weeks apart) | 1..W usable, rest usable (no join to jump to) | both sections | Jul–Sep '27 |
| 3a | Three holidays, all join within 10 | MIN · skip · J1 JOINS (first pair) · skip · J2 JOINS (all three) · long | holiday breaks below the last J, one long break from it | Christmas '26: skip 1 · MIN 2 · skip 3 · 4 joins Christmas + New Year · skip 5–9 · 10 joins all three |
| 3b | Three holidays, two join, one far | 1..W · skip · J JOINS · the far one keeps its own long weekend | both sections (the far one can't join) | Mar–Apr '27: Human Rights Day + Easter join at 3, Freedom Day apart |
| 3c | Three holidays, none join | as 2d | both sections | |
| 4+ | Several seasons (e.g. a whole year) | JOINS on each join (2027: 3 and 6), every other number usable | both sections; holiday breaks grouped by season (not built) | Jan–Dec '27 |

There's no step 3 and no separate long-break list: long breaks stop at the best value (a join), which is in the list.
Capped: one holiday → only its MIN; holidays that all join → nothing past the last JOINS (use the Calendar); holidays that can't all join → numbers past the last join stay usable (spreading leave); several seasons (a whole year) → JOINS on each join, every other number usable.

List rules that go with it:
- A single holiday's row must be a **proper break** (catch a weekend it doesn't already have for free): a Mon / Fri holiday plus one day (Thu–Sun, Fri–Mon) fills no gap, so it isn't listed; its row is the full week (4–5 leave) instead. Joins always count.
- The holiday breaks list shows **every row**: joins first (most holidays, then most days off), then each holiday's own break (best value first), so you can take the join or the separate long weekends (Christmas at 4: Christmas + New Year joined, Reconciliation (Wed, 2 days), Christmas as a full week). Ticking one greys the rows that clash with it; nothing is hidden.
- Easter and Christmas start with **nothing ticked**.
- Leftover leave after the joins (or fewer days than the first J) → the line points to the Calendar to use it there.

Edge cases:
- Holiday on a Saturday: gives nothing (Workers' Day Sat 1 May 2027). On a Sunday: moves to Monday (Women's Day Sun 9 Aug 2026 → Mon 10).
- No workday between two holidays: one holiday (Easter Fri–Mon; Christmas Fri 25 + Day of Goodwill Sat 26 Dec 2026).
- The join comes before MIN: the join is the minimum (Easter '27: 3, not 4; Freedom Fri 27 Apr + Workers' Tue 1 May 2029: 1 day joins).
- Less leave left than MIN / the first join: those numbers stay skipped; the line says to use the days on the Calendar. Leave left 0: nothing to plan.
- Breaks never run past the period, so a long weekend may shift (Christmas period starts 15 Dec: Reconciliation Wed 16 uses Thu–Fri).
- Two joins at the same leave: one JOINS tag, the line names the bigger join.
- Several seasons in one range: plain row, both sections, list by season (to build). This month with < 10 workdays left: Custom starts next month.
- A row overlaps a tick, or needs more leave than is left: greyed (never hidden), one note under the table.
- Advanced options (avoid months, school holidays): the list respects them; MIN / JOINS / skips don't yet. Holiday data ends after 2028 (Custom stops at January after next).

After picking: Add to summary → leave left over? → the line offers "use them on the Calendar →", which opens the Calendar with the holidays filter off and the leave days set to what's left. On the Calendar, a break over or right next to a saved one asks Combine / Replace.

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
