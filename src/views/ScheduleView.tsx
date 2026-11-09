import React, { useState } from "react"
import { useApp } from "../context/AppContext"
import { Booking } from "../types"
import { formatRoomName, formatRoomLocation, formatUserName, formatDepartment } from "../constants/translations"
import { BookingDetailModal } from "../components/modals/BookingDetailModal"

interface ScheduleViewProps {
  dateStr: string
  onOpenBookingModal?: (roomId?: string, date?: string) => void
  onNavigateToLogin?: () => void
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ dateStr, onOpenBookingModal, onNavigateToLogin }) => {
  const { t, language, rooms, bookings, users, currentUser } = useApp()
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null)

  // Click on "ว่าง" cell
  const handleAvailableClick = (roomId: string) => {
    if (!currentUser) {
      // Not logged in → go to login
      onNavigateToLogin?.()
      return
    }
    // Logged in (pending or approved) → open BookingModal (handles pending warning internally)
    onOpenBookingModal?.(roomId, dateStr)
  }

  const currentDate = new Date(dateStr + "T00:00:00")

  const availableRooms = rooms.filter((r) => r.status === "available")
  const dateBookings = bookings.filter((b) => b.date === dateStr && b.status === "approved")

  const formatHeaderDate = (d: Date) => {
    return d.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoomStatus = (roomId: string, period: "morning" | "afternoon") => {
    const rBookings = dateBookings.filter((b) => b.roomId === roomId)
    const hasBooking = rBookings.some((b) => {
      if (period === "morning") {
        return b.startTime < "12:00"
      } else {
        return b.endTime > "12:00" || b.startTime >= "12:00"
      }
    })
    return hasBooking ? "approved" : "available"
  }

  // Booking card — clickable
  const BookingCard = ({ b }: { b: Booking }) => {
    const u =
      users.find((u) => u.id === b.userId) ||
      (b.userName
        ? { name: b.userName, department: b.userDepartment || undefined, role: b.userRole || undefined }
        : undefined)
    const chairmanText =
      b.chairman ||
      (u
        ? `${formatUserName(u, language)} ${formatDepartment(u.department, u.role, language)}`
        : b.contactPerson || (language === "th" ? "ไม่ระบุ" : "-"))
    return (
      <button
        type="button"
        onClick={() => setInspectingBooking(b)}
        className="w-full text-center space-y-1.5 mb-4 sm:mb-6 last:mb-0 group cursor-pointer rounded-xl p-2.5 sm:p-2 bg-slate-50/80 dark:bg-slate-800/50 md:bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-slate-200/70 dark:border-slate-700/60 md:border-transparent hover:border-blue-200 dark:hover:border-blue-800"
      >
        <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
          {b.purpose}
        </p>
        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          {t.chairman || "ประธาน"}: {chairmanText}
        </p>
        <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t.time || "เวลา"} {b.startTime} - {b.endTime} น.
        </p>
        <p className="text-[10px] text-blue-500 dark:text-blue-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity font-medium">
          {language === "th" ? "กดเพื่อดูรายละเอียด →" : "Click for details →"}
        </p>
      </button>
    )
  }

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20"
        style={{ backgroundImage: "url('/backgrounds/Picture 5.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/80 backdrop-blur-[2px]" />

      <div className="relative z-10 p-3.5 sm:p-8 space-y-8 sm:space-y-10">

        {/* Section 1: Morning/Afternoon Table */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-2xl font-bold text-center text-purple-900 dark:text-purple-300 drop-shadow-sm px-2">
            วันที่ {formatHeaderDate(currentDate)}
          </h3>

          <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-lg border border-purple-200/50 dark:border-purple-900/50 overflow-hidden mx-auto max-w-5xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white font-semibold">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 border-r border-slate-600 dark:border-slate-800 sm:min-w-[220px]">{t.roomBreadcrumb?.split("/")[0] || "ห้องประชุม"}</th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 border-r border-slate-600 dark:border-slate-800 text-center whitespace-nowrap w-24">{t.capacity || "ความจุ"}</th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 border-r border-slate-600 dark:border-slate-800 text-center w-24 sm:w-32">{t.morning || "เช้า"}</th>
                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center w-24 sm:w-32">{t.afternoon || "บ่าย"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                  {availableRooms.map((room) => {
                    const morningStatus = getRoomStatus(room.id, "morning")
                    const afternoonStatus = getRoomStatus(room.id, "afternoon")
                    const morningBookings = dateBookings.filter(b => b.roomId === room.id && b.startTime < "12:00")
                    const afternoonBookings = dateBookings.filter(b => b.roomId === room.id && (b.endTime > "12:00" || b.startTime >= "12:00"))

                    return (
                      <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 border-r border-slate-200 dark:border-slate-700/50">
                          <p className="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                            {formatRoomName(room, language)}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatRoomLocation(room.location, language)}
                            <span className="sm:hidden"> • {room.capacity} {t.people || "ที่นั่ง"}</span>
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 border-r border-slate-200 dark:border-slate-700/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          {room.capacity}
                        </td>
                        <td className="px-1.5 sm:px-2 py-3 sm:py-4 border-r border-slate-200 dark:border-slate-700/50 text-center">
                          {morningStatus === "available" ? (
                            <button
                              type="button"
                              onClick={() => handleAvailableClick(room.id)}
                              className="text-emerald-500 font-bold hover:text-emerald-400 hover:underline underline-offset-2 cursor-pointer transition-colors py-1 px-2"
                              title="กดเพื่อจองช่วงเช้า"
                            >
                              {t.availableStatus || "ว่าง"}
                            </button>
                          ) : (
                            <div className="space-y-1">
                              {morningBookings.map(b => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setInspectingBooking(b)}
                                  className="inline-flex items-center justify-center gap-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-[#6aa84f] hover:bg-[#4e8a35] text-white rounded-md font-bold shadow-sm transition-colors cursor-pointer text-xs sm:text-sm"
                                  title={b.purpose}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{language === 'th' ? 'อนุมัติ' : 'Approved'}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-1.5 sm:px-2 py-3 sm:py-4 text-center">
                          {afternoonStatus === "available" ? (
                            <button
                              type="button"
                              onClick={() => handleAvailableClick(room.id)}
                              className="text-emerald-500 font-bold hover:text-emerald-400 hover:underline underline-offset-2 cursor-pointer transition-colors py-1 px-2"
                              title="กดเพื่อจองช่วงบ่าย"
                            >
                              {t.availableStatus || "ว่าง"}
                            </button>
                          ) : (
                            <div className="space-y-1">
                              {afternoonBookings.map(b => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setInspectingBooking(b)}
                                  className="inline-flex items-center justify-center gap-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-[#6aa84f] hover:bg-[#4e8a35] text-white rounded-md font-bold shadow-sm transition-colors cursor-pointer text-xs sm:text-sm"
                                  title={b.purpose}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{language === 'th' ? 'อนุมัติ' : 'Approved'}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Agenda Table */}
        <div className="space-y-4 pt-2 sm:pt-4">
          <div className="bg-[#151f32] dark:bg-[#1a2332] rounded-xl shadow-lg border border-purple-200/50 dark:border-purple-900/50 overflow-hidden mx-auto max-w-6xl">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white text-center py-3 sm:py-4 px-3 border-b border-purple-800/50">
              <h3 className="text-sm sm:text-lg md:text-xl font-bold">
                วันที่ {formatHeaderDate(currentDate)}
              </h3>
            </div>

            {/* Mobile Agenda View (< md) */}
            <div className="md:hidden bg-white dark:bg-[#1e293b] divide-y divide-slate-200 dark:divide-slate-700/60">
              {/* Morning Period */}
              <div className="p-3.5 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] text-white px-3 py-1 text-xs font-bold">
                  <span>☀️ {t.morning || "เช้า"}</span>
                </div>
                <div className="space-y-3">
                  {availableRooms.map((room) => {
                    const mBookings = dateBookings.filter(
                      (b) => b.roomId === room.id && b.startTime < "12:00",
                    )
                    return (
                      <div key={room.id} className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-3 space-y-2">
                        <p className="text-xs font-bold text-purple-800 dark:text-purple-300">
                          {formatRoomName(room, language)}
                        </p>
                        {mBookings.length > 0 ? (
                          mBookings.map((b) => <BookingCard key={b.id} b={b} />)
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            {language === "th" ? "ไม่มีรายการจอง" : "No bookings"}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lunch Break */}
              <div className="bg-[#0f172a] text-white text-center py-2.5 font-bold text-xs tracking-widest">
                {t.lunchBreak || "พักเที่ยง"}
              </div>

              {/* Afternoon Period */}
              <div className="p-3.5 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] text-white px-3 py-1 text-xs font-bold">
                  <span>🌤️ {t.afternoon || "บ่าย"}</span>
                </div>
                <div className="space-y-3">
                  {availableRooms.map((room) => {
                    const aBookings = dateBookings.filter(
                      (b) =>
                        b.roomId === room.id &&
                        (b.endTime > "12:00" || b.startTime >= "12:00"),
                    )
                    return (
                      <div key={room.id} className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-3 space-y-2">
                        <p className="text-xs font-bold text-purple-800 dark:text-purple-300">
                          {formatRoomName(room, language)}
                        </p>
                        {aBookings.length > 0 ? (
                          aBookings.map((b) => <BookingCard key={b.id} b={b} />)
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            {language === "th" ? "ไม่มีรายการจอง" : "No bookings"}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Matrix Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[800px]">
                <thead className="bg-purple-950/80 text-white font-semibold border-b border-purple-800/50">
                  <tr>
                    <th className="px-4 py-4 border-r border-slate-700/50 text-center w-24">{t.time || "เวลา"}</th>
                    {availableRooms.map(room => (
                      <th key={room.id} className="px-4 py-4 border-r border-slate-700/50 text-center min-w-[200px]">
                        {formatRoomName(room, language)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1e293b]">
                  <tr className="border-b border-slate-200 dark:border-slate-700/50">
                    <td className="bg-[#0f172a] text-white text-center font-bold px-2 py-6 border-r border-slate-700/50 align-top">
                      {t.morning || "เช้า"}
                    </td>
                    {availableRooms.map(room => {
                      const mBookings = dateBookings.filter(b => b.roomId === room.id && b.startTime < "12:00")
                      return (
                        <td key={room.id} className="p-4 border-r border-slate-200 dark:border-slate-700/50 align-top">
                          {mBookings.length > 0 ? mBookings.map(b => (
                            <BookingCard key={b.id} b={b} />
                          )) : null}
                        </td>
                      )
                    })}
                  </tr>

                  <tr>
                    <td colSpan={availableRooms.length + 1} className="bg-[#0f172a] text-white text-center py-3 font-bold text-sm tracking-widest border-y border-slate-700/50">
                      {t.lunchBreak || "พักเที่ยง"}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-200 dark:border-slate-700/50">
                    <td className="bg-[#0f172a] text-white text-center font-bold px-2 py-6 border-r border-slate-700/50 align-top">
                      {t.afternoon || "บ่าย"}
                    </td>
                    {availableRooms.map(room => {
                      const aBookings = dateBookings.filter(b => b.roomId === room.id && (b.endTime > "12:00" || b.startTime >= "12:00"))

                      return (
                        <td key={room.id} className="p-4 border-r border-slate-200 dark:border-slate-700/50 align-top">
                          {aBookings.length > 0 ? aBookings.map(b => (
                            <BookingCard key={b.id} b={b} />
                          )) : null}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {inspectingBooking && (
        <BookingDetailModal
          booking={inspectingBooking}
          onClose={() => setInspectingBooking(null)}
        />
      )}
    </div>
  )
}
