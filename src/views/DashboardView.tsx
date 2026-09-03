import React, { useState, useMemo } from "react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Clock,
  Plus,
  Filter,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { Badge } from "../components/common/Badge"
import { Booking, Room } from "../types"
import { getRoomColor, ROOM_COLORS } from "../constants/roomColors"
import { BookingDetailModal } from "../components/modals/BookingDetailModal"
import {
  formatRoomName,
  formatRoomLocation,
  formatUserName,
} from "../constants/translations"
import { CalendarDayPopover } from "../components/calendar/CalendarDayPopover"
import { ScheduleView } from "./ScheduleView"

interface DashboardViewProps {
  onNavigateTab?: (tab: string, filter?: string) => void
  onOpenBookingModal: (roomId?: string, date?: string) => void
}

const THAI_MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
]

const ENG_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAY_NAMES_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenBookingModal,
}) => {
  const { t, language, rooms, bookings, currentUser } = useApp()
  const isAdmin = currentUser?.role === "admin"

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() // 0-11
  const todayDateStr = today.toISOString().split("T")[0]

  const [currentYear, setCurrentYear] = useState(todayYear)
  const [currentMonth, setCurrentMonth] = useState(todayMonth)
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | null>(
    null,
  )
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(
    null,
  )

  const [popoverDate, setPopoverDate] = useState<string | null>(null)
  const [popoverBookings, setPopoverBookings] = useState<Booking[]>([])
  const [scheduleDate, setScheduleDate] = useState<string>(todayDateStr)

  // Quick stats calculations
  const availableRoomsCount = useMemo(
    () => rooms.filter((r) => r.status === "available").length,
    [rooms],
  )
  const todayApprovedBookings = useMemo(
    () =>
      bookings.filter((b) => b.date === todayDateStr && b.status === "approved"),
    [bookings, todayDateStr],
  )
  const pendingBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings],
  )

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleJumpToday = () => {
    setCurrentYear(todayYear)
    setCurrentMonth(todayMonth)
  }

  // Generate 7-column calendar matrix
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() // 0 for Sun, 1 for Mon...
    const totalDaysInMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate()
    const totalDaysInPrevMonth = new Date(
      currentYear,
      currentMonth,
      0,
    ).getDate()

    const cells: {
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isToday: boolean
    }[] = []

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum)
      const prevDateStr = prevDate.toISOString().split("T")[0]
      cells.push({
        dateStr: prevDateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: prevDateStr === todayDateStr,
      })
    }

    // 2. Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0")
      const dayStr = String(d).padStart(2, "0")
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`
      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayDateStr,
      })
    }

    // 3. Next month leading days to complete 7-col grid (up to multiple of 7)
    const remaining = (7 - (cells.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d)
      const nextDateStr = nextDate.toISOString().split("T")[0]
      cells.push({
        dateStr: nextDateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: nextDateStr === todayDateStr,
      })
    }

    return cells
  }, [currentYear, currentMonth, todayDateStr])

  // Filter bookings for calendar — show approved only
  const activeBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status !== "approved") return false
      if (selectedRoomFilter && b.roomId !== selectedRoomFilter) return false
      return true
    })
  }, [bookings, selectedRoomFilter])

  const monthNames = language === "th" ? THAI_MONTH_NAMES : ENG_MONTH_NAMES
  const dayNames = language === "th" ? DAY_NAMES_TH : DAY_NAMES_EN
  const displayYear = language === "th" ? currentYear + 543 : currentYear

  const formatHeaderDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── 3. Main Monthly Booking Calendar Container ─── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Calendar Title & Month Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Calendar Section Header */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white">
                {t.calendarTitle || "ปฏิทินการจอง ห้องประชุม"}
              </h3>
            </div>

            {/* Month & Year Navigator */}
            <div className="flex items-center gap-2">
              {/* Prev button */}
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Month Selector */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-xs"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                  <option key={y} value={y}>
                    {language === "th" ? y + 543 : y}
                  </option>
                ))}
              </select>

              {/* Next button */}
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                title="เดือนถัดไป"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── 7-Column Calendar Grid ─── */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Day Name Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-center text-xs font-bold text-blue-600 dark:text-blue-400 py-3">
              {dayNames.map((dName, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx === 0 || idx === 6
                      ? "text-rose-500 dark:text-rose-400"
                      : ""
                  }`}
                >
                  {dName}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              {calendarCells.map((cell, idx) => {
                const cellBookings = activeBookings
                  .filter((b) => b.date === cell.dateStr)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setScheduleDate(cell.dateStr)
                      setTimeout(() => {
                        document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth" })
                      }, 50)
                    }}
                    className={`min-h-[110px] p-1.5 flex flex-col justify-between transition-colors group relative cursor-pointer ${
                      cell.isCurrentMonth
                        ? "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        : "bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 opacity-60"
                    }`}
                  >
                    {/* Date Number Header inside cell */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          cell.isToday
                            ? "bg-rose-500 text-white font-extrabold shadow-xs"
                            : cell.isCurrentMonth
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Quick add booking button on cell hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenBookingModal(undefined, cell.dateStr)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-opacity cursor-pointer"
                        title={`จองห้องสำหรับวันที่ ${cell.dateStr}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Booking Pills List */}
                    <div className="flex-1 space-y-1 mt-1 overflow-hidden relative">
                      {cellBookings.slice(0, 1).map((b) => {
                        const roomCol = getRoomColor(b.roomId)
                        const startHour = parseInt(b.startTime.split(":")[0], 10)
                        const endHour = parseInt(b.endTime.split(":")[0], 10)
                        
                        let timeLabel = "ช่วงเวลา"
                        if (startHour < 12 && endHour <= 12) timeLabel = "เช้า"
                        else if (startHour >= 12) timeLabel = "บ่าย"
                        else if (startHour < 12 && endHour > 12) timeLabel = "ทั้งวัน"

                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setInspectingBooking(b)
                            }}
                            className={`w-full text-left rounded-md px-1.5 py-1 text-[10px] sm:text-[11px] font-semibold ${roomCol.bgClass} ${roomCol.textClass} shadow-xs hover:opacity-90 hover:scale-[1.01] transition-all truncate block cursor-pointer`}
                            title={`เวลา ${b.startTime} - ${b.endTime} น.: ${b.purpose}`}
                          >
                            <span className="flex items-center gap-1 truncate">
                              <span className="truncate">
                                {timeLabel} ({b.purpose})
                              </span>
                            </span>
                          </button>
                        )
                      })}
                      {cellBookings.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPopoverDate(cell.dateStr)
                            setPopoverBookings(cellBookings)
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full text-left px-1 py-0.5 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 cursor-pointer"
                        >
                          +{cellBookings.length - 1} {t.more || "เพิ่มเติม"}
                        </button>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── 4. Room Color Legend Bar at Bottom ─── */}
        <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {/* Filter Reset */}
            <button
              onClick={() => setSelectedRoomFilter(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedRoomFilter === null
                  ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs"
                  : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
              }`}
            >
              <span>{t.allRoomsLegend || "ทุกห้องประชุม"}</span>
            </button>

            {/* Room items matching KCMH footer legend */}
            {rooms.map((room, idx) => {
              const rColor = getRoomColor(room.id, idx)
              const isSelected = selectedRoomFilter === room.id

              return (
                <button
                  key={room.id}
                  onClick={() =>
                    setSelectedRoomFilter((prev) =>
                      prev === room.id ? null : room.id,
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-white dark:bg-slate-800 shadow-md font-bold"
                      : "hover:bg-white/80 dark:hover:bg-slate-800/60"
                  }`}
                  title={`${t.clickToFilter || "คลิกเพื่อกรองเฉพาะห้องนี้"}`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${rColor.dotClass} shadow-xs flex-none`}
                  />
                  <span>{formatRoomName(room, language)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── 5. Schedule Section (Scroll Target) ─── */}
      <div id="schedule-section" className="pt-4 scroll-mt-24">
        <ScheduleView dateStr={scheduleDate} />
      </div>

      {/* ─── 6. Day Popover Modal ─── */}
      {popoverDate && (
        <CalendarDayPopover
          date={popoverDate}
          bookings={popoverBookings}
          getRoomColor={getRoomColor}
          onClose={() => { setPopoverDate(null); setPopoverBookings([]) }}
          onBookingClick={(b) => { setInspectingBooking(b); setPopoverDate(null); setPopoverBookings([]) }}
          formatHeaderDate={formatHeaderDate}
        />
      )}

      {/* ─── 7. Booking Detail Inspection Modal ─── */}
      {inspectingBooking && (
        <BookingDetailModal
          booking={inspectingBooking}
          onClose={() => setInspectingBooking(null)}
        />
      )}
    </div>
  )
}
export default DashboardView
