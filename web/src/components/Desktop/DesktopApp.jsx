import { useState } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { CalendarKey } from './CalendarKey'
import { ThemeToggle } from './ThemeToggle'
import { HelpPanel } from './HelpPanel'
import { HelpButton } from '../Help/HelpButton'
import { GuidedTour } from '../Help/GuidedTour'
import { tourSteps } from '../Help/tourSteps'
import { useSettings } from '../../hooks/useSettings'
import { useWelcome } from '../../hooks/useWelcome'
import { ControlRail } from './Rail/ControlRail'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { BreakDetailPanel } from './BreakDetailPanel'
import { MyBreaksPanel } from './MyBreaksPanel'
import { PreviewBanner } from './PreviewBanner'
import { OverviewPage } from './Overview/OverviewPage'
import { EventsComingSoon } from './EventsComingSoon'
import { HolidaysList } from '../Features/HolidaysList'
import { useLeavePlanner, ALLOWANCE } from '../../hooks/useLeavePlanner'

const RAIL_KEY = 'stretchmyleave.railCollapsed'

// Remembered between visits; on first visit, narrower windows start collapsed.
function initialRailCollapsed() {
  try {
    const stored = localStorage.getItem(RAIL_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* storage unavailable — fall back to the window width */ }
  return window.innerWidth < 1200
}

export function DesktopApp() {
  const {
    controls, period, colourBy, holidayFilter, picksOnly, setPicksOnly, activeDaysOff, province, setProvince, schoolDates,
    months, breaks, demoDate, plans, selectedPlan, setSelectedPlanId, eventsSelected, ticked, toggleTick, toggleAllTicks, exportBreaks,
    preview, setPreview, previewOnly, previewDays, previewLabel, openPreview,
    saved, savedBreaks, savedDayTypes, savedStarts, isSaved, justAddedKey, setJustAddedKey,
    detailBreak, nextBreak, bestNote, equalStarts, overlaps, combined, leaveLeft,
    selectDay, openBreak, addBreaks, addDetailBreak, replaceOverlaps, removeBreak,
  } = useLeavePlanner()
  const { theme, setTheme } = useSettings()
  const { showWelcome, closeWelcome, replayWelcome } = useWelcome()
  const [helpOpen, setHelpOpen] = useState(false)
  // A first visit opens on the calendar so the tour can point at it.
  const [page, setPage] = useState(showWelcome ? 'calendar' : 'overview')
  const [railCollapsed, setRailCollapsed] = useState(initialRailCollapsed)
  const [tab, setTab] = useState('details')
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

  function toggleRail() {
    const next = !railCollapsed
    setRailCollapsed(next)
    try {
      localStorage.setItem(RAIL_KEY, String(next))
    } catch { /* storage unavailable — just don't remember it */ }
  }

  const railControls = { ...controls, collapsed: railCollapsed, onToggleCollapsed: toggleRail }

  // The calendar page is exactly one screen tall: only the months scroll, while
  // the controls and the Details/Summary panel stay put. Other pages scroll normally.
  const calendarPage = page === 'calendar'

  return (
    <div className={`bg-slate-50 text-slate-900 ${calendarPage ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <DesktopHeader page={page} onPageChange={setPage} rightSlot={
          <div className="flex items-center gap-2">
            <HelpButton onClick={() => setHelpOpen(true)} />
            {calendarPage && <CalendarKey />}
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
              picksOnly={picksOnly}
              savedDayTypes={savedDayTypes}
              savedStarts={savedStarts}
              previewDayTypes={previewOnly ? previewDays.dayTypes : null}
              previewStarts={previewOnly ? previewDays.starts : null}
              schoolDates={schoolDates}
              daysOffFilter={activeDaysOff}
              hoveredDate={hoveredDate}
              selectedBreak={detailBreak}
              onDayHover={setHoveredDate}
              onDayClick={handleDayClick}
            />
          </div>

          <SidePanel
            tab={tab}
            onTabChange={setTab}
            savedCount={saved.length}
            details={
              <BreakDetailPanel
                brk={detailBreak}
                nextBreak={nextBreak}
                bestNote={bestNote}
                label={previewLabel}
                equalStarts={equalStarts}
                onPickStart={startDate => openBreak({ startDate, leaveDays: detailBreak.leaveDays })}
                isSaved={detailBreak ? isSaved(detailBreak) : false}
                onAdd={() => { addDetailBreak(); setTab('summary') }}
                overlaps={overlaps}
                combined={combined}
                onReplace={() => { replaceOverlaps(); setTab('summary') }}
                leaveLeft={leaveLeft}
                allowance={ALLOWANCE}
                onRemove={() => removeBreak(detailBreak)}
              />
            }
            summary={
              <MyBreaksPanel
                breaks={savedBreaks}
                allowance={ALLOWANCE}
                justAddedKey={justAddedKey}
                onOpen={b => { openBreak(b); setTab('details') }}
                onRemove={removeBreak}
                onDismissAdded={() => setJustAddedKey(null)}
                mineOnly={picksOnly}
                onMineOnlyChange={setPicksOnly}
              />
            }
          />
        </main>
      )}
      {!calendarPage && (
      <main className="max-w-[1320px] mx-auto px-6 pt-6 pb-10 flex flex-col gap-4">
        {page === 'overview' && (
          <OverviewPage
            plans={plans}
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlanId}
            period={period}
            ticked={ticked}
            onToggle={toggleTick}
            onToggleAll={toggleAllTicks}
            isSaved={isSaved}
            onAdd={addBreaks}
            onExport={exportBreaks}
            onView={viewOnCalendar}
            province={province}
            onProvinceChange={setProvince}
            eventsSelected={eventsSelected}
          />
        )}

        {page === 'events' && <EventsComingSoon variant="page" />}

        {page === 'holidays' && <HolidaysList months={months} showSchoolHolidays={false} provinceCode="GP" />}
      </main>
      )}
      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} onReplay={() => { setHelpOpen(false); setPage('calendar'); replayWelcome() }} />}
      {showWelcome && calendarPage && (
        <GuidedTour
          steps={tourSteps(false, demoDate, {
            reset: () => setTab('details'),
            showDate: () => { selectDay(demoDate); setTab('details') },
            showSummary: () => setTab('summary'),
          })}
          onClose={() => { closeWelcome(); setTab('details') }}
        />
      )}
    </div>
  )
}
