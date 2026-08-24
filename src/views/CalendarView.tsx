import React, { useState, useMemo } from "react"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  DoorOpen,
  Users,
  CheckCircle,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { Badge } from "../components/common/Badge"
import {
  formatRoomName,
  formatRoomLocation,
  formatUserName,
  formatDepartment,
} from "../constants/translations"

interface CalendarViewProps {
  onOpenBookingModal: (roomId?: string, date?: string) => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenBookingModal,
}) => {
  const { t, rooms, bookings, users, language } = useApp()

  const todayStr = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const activeRooms = useMemo(
    () => rooms.filter((r) => r.status === "available"),
    [rooms],
  )

  const dateBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.date === selectedDate &&
        b.status !== "rejected" &&
        b.status !== "cancelled",
    )
  }, [bookings, selectedDate])

  const shiftDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split("T")[0])
  }

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Date Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => shiftDate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                selectedDate === todayStr
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              {t.today}
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
            {formatHeaderDate(selectedDate)}
          </p>

          <button
            onClick={() => onOpenBookingModal(undefined, selectedDate)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.bookRoom}</span>
          </button>
        </div>
      </div>

      {/* Room Timeline Cards */}
      <div className="grid grid-cols-1 gap-4">
        {activeRooms.map((room) => {
          const roomBookings = dateBookings
            .filter((b) => b.roomId === room.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))

          return (
            <div
              key={room.id}
              className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200"
            >
              {/* Room Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <DoorOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatRoomName(room, language)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatRoomLocation(room.location, language)} • {t.capacity} {room.capacity} {t.people}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {roomBookings.length} {t.items}
                  </span>
                  <button
                    onClick={() => onOpenBookingModal(room.id, selectedDate)}
                    className="flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-200/80 dark:border-blue-900/60 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{t.bookThisRoom}</span>
                  </button>
                </div>
              </div>

              {/* Room Bookings List on this Date */}
              {roomBookings.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t.noBookingAllDay}
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
                  {roomBookings.map((b) => {
                    const user = users.find((u) => u.id === b.userId)
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {b.startTime} – {b.endTime}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {b.purpose}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatUserName(user, language) || t.staff} (
                              {formatDepartment(user?.department, user?.role, language)}) • {b.attendees}{" "}
                              {t.people}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge status={b.status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CalendarView
