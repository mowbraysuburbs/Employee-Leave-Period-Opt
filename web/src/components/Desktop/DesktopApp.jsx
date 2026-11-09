import { useState } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { CalendarKey } from './CalendarKey'
import { ThemeToggle } from './ThemeToggle'
import { HelpPanel } from './HelpPanel'
import { HelpButton } from '../Help/HelpButton'
import { GuidedTour } from '../Help/GuidedTour'
import { calendarTourSteps, plannerTourSteps } from '../Help/tourSteps'
import { useSettings } from '../../hooks/useSettings'
import { useWelcome } from '../../hooks/useWelcome'
import { ControlRail } from './Rail/ControlRail'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { PanelCollapsed } from './PanelCollapsed'
import { BreakDetailPanel } from './BreakDetailPanel'
import { BreakDetailHead } from './BreakDetailHead'
import { MyBreaksPanel } from './MyBreaksPanel'
import { PreviewBanner } from './PreviewBanner'
import { OverviewPage } from './Overview/OverviewPage'
import { EventsComingSoon } from './EventsComingSoon'
import { HolidaysList } from '../Features/HolidaysList'
import { useLeavePlanner } from '../../hooks/useLeavePlanner'

const RAIL_KEY = 'stretchmyleave.railCollapsed'
const PANEL_KEY = 'stretchmyleave.panelCollapsed'

// Remembered between visits; on first visit, narrower windows start collapsed.
function initialRailCollapsed() {
  try {
    const stored = localStorage.getItem(RAIL_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* storage unavailable — fall back to the window width */ }
  return window.innerWidth < 1200
}

// The Details / Summary panel starts open unless it was collapsed last time.
function initialPanelCollapsed() {
  try {
    return localStorage.getItem(PANEL_KEY) === 'true'
  } catch {
    return false
  }
}

export function DesktopApp() {
  const { theme, setTheme, leaveTotal, setLeaveTotal } = useSettings()
  const {
    controls, activeFilters, clearAllFilters, colourBy, holidayFilter, gapOnly, picksOnly, setPicksOnly, activeDaysOff, province, setProvince, schoolDates,
    months, breaks, holidayView, demoDate, planner,
    preview, setPreview, previewOnly, previewDays, previewLabel, openPreview, openRestOnCalendar,
    saved, savedBreaks, savedDayTypes, savedStarts, isSaved, justAddedKey,
    detailBreak, bestNote, equalStarts, overlaps, combined,
    selectDay, openBreak, addBreaks, addDetailBreak, replaceOverlaps, removeBreak, clearSummary, moveBreak,
  } = useLeavePlanner({ leaveLimit: leaveTotal, onLeaveLimitChange: setLeaveTotal })
  // Each page has its own first-visit tour.
  const overviewTour = useWelcome()
  const calendarTour = useWelcome('stretchmyleave.calendarTourSeen')
  const [helpOpen, setHelpOpen] = useState(false)
  // A first visit opens on the Overview with the planner tour.
  const [page, setPage] = useState('overview')
  const [railCollapsed, setRailCollapsed] = useState(initialRailCollapsed)
  const [tab, setTab] = useState('details')
  const [panelCollapsed, setPanelCollapsed] = useState(initialPanelCollapsed)
  // The day under the mouse only drives the hover card and band; Details
  // changes when a day is clicked, so people can read it while moving around.
  const [hoveredDate, setHoveredDate] = useState(null)

  function handleDayClick(date) {
    selectDay(date)
    setHoveredDate(null)
    setTab('details')
  }

  // Opens the calendar filtered to the ticked breaks, with the earliest in Details.
  function viewOnCalendar(list) {
    openPreview(list)
    setTab('details')
    setPage('calendar')
  }

  // The Overview's "Use on the Calendar": the leave that's left, anywhere.
  function sendRestToCalendar() {
    openRestOnCalendar()
    setTab('details')
    setPage('calendar')
  }

  // Collapses / opens the calendar's Details / Summary panel (remembered), optionally on a tab.
  function setPanel(collapsed, onTab) {
    setPanelCollapsed(collapsed)
    if (onTab) setTab(onTab)
    try {
      localStorage.setItem(PANEL_KEY, String(collapsed))
    } catch { /* storage unavailable — just don't remember it */ }
  }

  function toggleRail() {
    const next = !railCollapsed
    setRailCollapsed(next)
    try {
      localStorage.setItem(RAIL_KEY, String(next))
    } catch { /* storage unavailable — just don't remember it */ }
  }

  // The Calendar tour points at both side columns, so it opens them if collapsed.
  function openColumns() {
    if (railCollapsed) toggleRail()
    if (panelCollapsed) setPanel(false)
    setTab('details')
  }

  const railControls = { ...controls, collapsed: railCollapsed, onToggleCollapsed: toggleRail, activeCount: activeFilters.length, onClearAll: clearAllFilters }

  // The calendar is one screen tall: only the months scroll, while the controls
  // and the Details/Summary panel stay put. Other pages scroll normally.
  const calendarPage = page === 'calendar'
  // The calendar and the Overview are one screen tall, with the same layout and side panel.
  const fullScreen = calendarPage || page === 'overview'

  return (
    <div className={`bg-slate-50 text-slate-900 ${fullScreen ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <DesktopHeader page={page} onPageChange={setPage} rightSlot={
          <div className="flex items-center gap-2">
            <HelpButton onClick={() => setHelpOpen(true)} />
            {(calendarPage || page === 'overview') && <CalendarKey />}
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        }
      />
      {calendarPage && (
        <main className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-6 py-4 flex gap-5">
          <ControlRail c={railControls} />

          <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
            {preview && (
              <PreviewBanner
                title={preview.title}
                onBack={() => setPage('overview')}
                onClear={() => setPreview(null)}
              />
            )}
            <YearCalendar
              months={months}
              breaks={breaks}
              colourBy={colourBy}
              holidayFilter={holidayFilter}
              gapOnly={gapOnly}
              picksOnly={picksOnly}
              savedDayTypes={savedDayTypes}
              savedStarts={savedStarts}
              previewDayTypes={previewOnly ? previewDays.dayTypes : null}
              schoolDates={schoolDates}
              daysOffFilter={activeDaysOff}
              holidayView={holidayView}
              hoveredDate={hoveredDate}
              selectedBreak={detailBreak}
              onDayHover={setHoveredDate}
              onDayClick={handleDayClick}
            />
          </div>

          {panelCollapsed ? (
            <PanelCollapsed
              tab={tab}
              onTabChange={setTab}
              onExpand={onTab => setPanel(false, onTab)}
              brk={detailBreak}
              flexibleStarts={equalStarts?.length ?? 1}
              savedBreaks={savedBreaks}
            />
          ) : (
          // A full-width "Collapse to icons" bar above the panel, mirroring the left rail's.
          <div className="w-[300px] xl:w-[340px] shrink-0 h-full flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setPanel(true)}
            aria-label="Collapse details and summary"
            className="shrink-0 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
          >
            Collapse to icons »
          </button>
          <SidePanel
            width="w-full flex-1 min-h-0"
            tab={tab}
            onTabChange={setTab}
            savedCount={saved.length}
            head={tab === 'details' && (
              <BreakDetailHead
                brk={detailBreak}
                isSaved={detailBreak ? isSaved(detailBreak) : false}
                onAdd={() => { addDetailBreak(); setTab('summary') }}
                overlaps={overlaps}
                combined={combined}
                onReplace={() => { replaceOverlaps(); setTab('summary') }}
                onRemove={() => removeBreak(detailBreak)}
              />
            )}
            details={
              <BreakDetailPanel
                brk={detailBreak}
                bestNote={bestNote}
                label={previewLabel}
                equalStarts={equalStarts}
                onPickStart={startDate => (isSaved(detailBreak) ? moveBreak(detailBreak, startDate) : openBreak({ startDate, leaveDays: detailBreak.leaveDays }))}
              />
            }
            summary={
              <MyBreaksPanel
                breaks={savedBreaks}
                justAddedKey={justAddedKey}
                onOpen={b => { openBreak(b); setTab('details') }}
                onRemove={removeBreak}
                onClearAll={clearSummary}
                mineOnly={picksOnly}
                onMineOnlyChange={setPicksOnly}
              />
            }
          />
          </div>
          )}
        </main>
      )}
      {page === 'overview' && (
        <main className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-6 py-4 overflow-y-auto lg:overflow-hidden">
            <OverviewPage
              planner={planner}
              isSaved={isSaved}
              onAdd={addBreaks}
              onView={viewOnCalendar}
              onUseRest={sendRestToCalendar}
              province={province}
              onProvinceChange={setProvince}
              savedCount={saved.length}
              savedBreaks={savedBreaks}
              collapsed={panelCollapsed}
              onCollapsedChange={collapsed => setPanel(collapsed)}
              summary={
                <MyBreaksPanel
                  breaks={savedBreaks}
                  justAddedKey={justAddedKey}
                  onOpen={b => { openBreak(b); setTab('details'); setPage('calendar') }}
                  onRemove={removeBreak}
                  onClearAll={clearSummary}
                  mineOnly={picksOnly}
                  onMineOnlyChange={setPicksOnly}
                />
              }
            />
        </main>
      )}
      {!fullScreen && (
      <main className="max-w-[1320px] mx-auto px-6 pt-6 pb-10 flex flex-col gap-4">
        {page === 'events' && <EventsComingSoon variant="page" />}

        {page === 'holidays' && <HolidaysList months={months} showSchoolHolidays={false} provinceCode="GP" />}
      </main>
      )}
      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} onReplay={() => { setHelpOpen(false); if (calendarPage) calendarTour.replayWelcome(); else { setPage('overview'); overviewTour.replayWelcome() } }} />}
      {/* The tour for the page you're on: the planner journey on the Overview, the calendar tour on the Calendar. */}
      {overviewTour.showWelcome && page === 'overview' && <GuidedTour steps={plannerTourSteps(false, { openPanel: () => setPanel(false) })} onClose={overviewTour.closeWelcome} />}
      {calendarTour.showWelcome && calendarPage && !overviewTour.showWelcome && (
        <GuidedTour
          steps={calendarTourSteps(breaks[demoDate], {
            reset: openColumns,
            showDate: () => { openColumns(); selectDay(demoDate) },
            showSummary: () => { openColumns(); setTab('summary') },
          })}
          onClose={() => { calendarTour.closeWelcome(); setTab('details') }}
        />
      )}
    </div>
  )
}
