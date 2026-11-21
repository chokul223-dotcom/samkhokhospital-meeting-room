import React, { useState, useMemo, useRef, useEffect } from "react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
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
  toLocalDateStr,
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
  const todayDateStr = toLocalDateStr(today)

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
  const [openPicker, setOpenPicker] = useState<"month" | "year" | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openPicker) return
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(null)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPicker(null)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [openPicker])

  const yearOptions = useMemo(() => {
    const startYear = Math.min(2024, todayYear - 2)
    const endYear = Math.max(2029, todayYear + 3)
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [todayYear])

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
      const prevDateStr = toLocalDateStr(prevDate)
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
      const nextDateStr = toLocalDateStr(nextDate)
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
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl">
        {/* Calendar Title & Month Toolbar (Purple Theme) */}
        <div
          ref={pickerRef}
          className="relative z-20 rounded-t-3xl bg-gradient-to-br from-[#1b0738] via-[#3b1170] to-[#6d28d9] p-4 sm:p-6 text-white border-b border-purple-900/50"
        >
          {/* Decorative blurs clipped cleanly inside header */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-3xl">
            <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4">
            {/* Calendar Section Header */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur shadow-inner animate-float-subtle">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-purple-200/90 mb-0.5">
                  {language === "th" ? "ตารางการใช้งาน" : "Schedule"}
                </p>
                <h3 className="text-base sm:text-xl font-bold leading-tight truncate">
                  {t.calendarTitle || "ปฏิทินการจอง ห้องประชุม"}
                </h3>
              </div>
            </div>

            {/* Month & Year Navigator */}
            <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Prev button */}
              <button
                type="button"
                onClick={() => {
                  setOpenPicker(null)
                  handlePrevMonth()
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer shadow-xs backdrop-blur flex-none"
                title={language === "th" ? "เดือนก่อนหน้า" : "Previous month"}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center min-w-0">
                {/* Custom Month Selector Trigger */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenPicker((prev) => (prev === "month" ? null : "month"))
                  }
                  aria-expanded={openPicker === "month"}
                  className={`flex-1 sm:flex-initial min-w-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-xs backdrop-blur ${
                    openPicker === "month"
                      ? "bg-white/25 ring-2 ring-white/60"
                      : "bg-white/10 hover:bg-white/20 ring-1 ring-white/20"
                  }`}
                >
                  <span className="truncate">{monthNames[currentMonth]}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 flex-none text-purple-200 transition-transform duration-200 ${
                      openPicker === "month" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Custom Year Selector Trigger */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenPicker((prev) => (prev === "year" ? null : "year"))
                  }
                  aria-expanded={openPicker === "year"}
                  className={`flex-none inline-flex items-center justify-center gap-1 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-xs backdrop-blur ${
                    openPicker === "year"
                      ? "bg-white/25 ring-2 ring-white/60"
                      : "bg-white/10 hover:bg-white/20 ring-1 ring-white/20"
                  }`}
                >
                  <span>{displayYear}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 flex-none text-purple-200 transition-transform duration-200 ${
                      openPicker === "year" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Jump to Today */}
                {(currentYear !== todayYear || currentMonth !== todayMonth) && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPicker(null)
                      handleJumpToday()
                    }}
                    className="flex-none flex h-9 sm:h-10 items-center justify-center rounded-xl bg-fuchsia-500/85 hover:bg-fuchsia-500 text-white text-xs font-bold px-2.5 sm:px-4 transition-colors cursor-pointer shadow-xs ring-1 ring-fuchsia-300/50 backdrop-blur"
                    title={language === "th" ? "เดือนปัจจุบัน" : "This Month"}
                  >
                    {language === "th" ? "วันนี้" : "Today"}
                  </button>
                )}
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={() => {
                  setOpenPicker(null)
                  handleNextMonth()
                }}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer shadow-xs backdrop-blur flex-none"
                title={language === "th" ? "เดือนถัดไป" : "Next month"}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* ── Custom Bounded Month / Year Popover (Never overflows mobile viewport) ── */}
          {openPicker && (
            <div className="absolute left-3 right-3 sm:left-auto sm:right-6 top-full mt-2 z-40 sm:w-80 rounded-2xl bg-white dark:bg-[#141a2e] text-slate-900 dark:text-white border border-slate-200/90 dark:border-purple-500/30 shadow-2xl shadow-purple-950/40 p-3.5 animate-in fade-in zoom-in-95 duration-150">
              {/* Popover Header: Month / Year Mode Tabs + Close */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1">
                  <button
                    type="button"
                    onClick={() => setOpenPicker("month")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      openPicker === "month"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {language === "th" ? "เลือกเดือน" : "Month"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenPicker("year")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      openPicker === "year"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {language === "th" ? "เลือกปี" : "Year"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenPicker(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  title={language === "th" ? "ปิด" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Month Grid (3 x 4) */}
              {openPicker === "month" ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {monthNames.map((mName, idx) => {
                    const isSelected = idx === currentMonth
                    const isRealTodayMonth =
                      idx === todayMonth && currentYear === todayYear
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentMonth(idx)
                          setOpenPicker(null)
                        }}
                        className={`relative rounded-xl px-2 py-2.5 text-xs font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-600/30"
                            : isRealTodayMonth
                              ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400/60 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="block truncate">{mName}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                /* Year Grid (3 columns) */
                <div className="grid grid-cols-3 gap-2">
                  {yearOptions.map((y) => {
                    const isSelected = y === currentYear
                    const isRealTodayYear = y === todayYear
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setCurrentYear(y)
                          setOpenPicker(null)
                        }}
                        className={`rounded-xl px-2 py-2.5 text-sm font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-600/30"
                            : isRealTodayYear
                              ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400/60 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {language === "th" ? y + 543 : y}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Quick Jump to Today Footer */}
              {(currentYear !== todayYear || currentMonth !== todayMonth) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      handleJumpToday()
                      setOpenPicker(null)
                    }}
                    className="w-full rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === "th"
                      ? `กลับไปเดือนปัจจุบัน (${monthNames[todayMonth]} ${todayYear + 543})`
                      : `Back to Today (${monthNames[todayMonth]} ${todayYear})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── 7-Column Calendar Grid ─── */}
        <div className="w-full">
          <div className="w-full">
            {/* Day Name Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center text-[11px] sm:text-xs font-bold text-purple-700 dark:text-purple-400 py-2.5 sm:py-3">
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
                    className={`min-h-[70px] sm:min-h-[96px] md:min-h-[110px] p-1 sm:p-1.5 flex flex-col justify-between transition-colors group relative cursor-pointer min-w-0 ${
                      cell.isCurrentMonth
                        ? "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        : "bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 opacity-60"
                    }`}
                  >
                    {/* Date Number Header inside cell */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full leading-none sm:leading-normal ${
                          cell.isToday
                            ? "bg-rose-500 text-white font-extrabold shadow-xs"
                            : cell.isCurrentMonth
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Quick add booking button on cell hover (desktop/tablet) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenBookingModal(undefined, cell.dateStr)
                        }}
                        className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-opacity cursor-pointer"
                        title={`จองห้องสำหรับวันที่ ${cell.dateStr}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Booking Pills List */}
                    <div className="flex-1 space-y-0.5 sm:space-y-1 mt-1 overflow-hidden relative">
                      {cellBookings.slice(0, 1).map((b) => {
                        const roomCol = getRoomColor(b.roomId)
                        
                        let timeLabel = t.timeSlot || "ช่วงเวลา"
                        if (b.startTime < "12:00" && b.endTime <= "12:00") timeLabel = t.morning || "เช้า"
                        else if (b.startTime >= "12:00") timeLabel = t.afternoon || "บ่าย"
                        else if (b.startTime < "12:00" && b.endTime > "12:00") timeLabel = t.fullDay || "ทั้งวัน"

                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (cellBookings.length > 1 && window.innerWidth < 640) {
                                setPopoverDate(cell.dateStr)
                                setPopoverBookings(cellBookings)
                              } else {
                                setInspectingBooking(b)
                              }
                            }}
                            className={`w-full text-left rounded sm:rounded-md px-1 sm:px-1.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold ${roomCol.bgClass} ${roomCol.textClass} shadow-2xs hover:opacity-90 sm:hover:scale-[1.01] transition-all truncate block cursor-pointer leading-tight`}
                            title={`เวลา ${b.startTime} - ${b.endTime} น.: ${b.purpose}`}
                          >
                            <span className="sm:hidden truncate block">
                              {timeLabel}
                            </span>
                            <span className="hidden sm:flex items-center gap-1 truncate">
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
                          className="text-[9px] sm:text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors w-full text-left px-0.5 sm:px-1 py-0.5 rounded-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 cursor-pointer truncate leading-tight"
                        >
                          +{cellBookings.length - 1} <span className="hidden sm:inline">{t.more || "เพิ่มเติม"}</span>
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
        <div className="rounded-b-3xl p-3.5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
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
        <ScheduleView
          dateStr={scheduleDate}
          onOpenBookingModal={onOpenBookingModal}
          onNavigateToLogin={() => onNavigateTab?.("login")}
        />
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
