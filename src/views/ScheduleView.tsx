import React, { useState } from "react"
import { useApp } from "../context/AppContext"
import { Booking } from "../types"
import { formatRoomName, formatRoomLocation, formatUserName, formatDepartment } from "../constants/translations"
import { BookingDetailModal } from "../components/modals/BookingDetailModal"

interface ScheduleViewProps {
  dateStr: string
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ dateStr }) => {
  const { t, language, rooms, bookings, users } = useApp()
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null)

  const currentDate = new Date(dateStr)

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
      const startHour = parseInt(b.startTime.split(":")[0], 10)
      const endHour = parseInt(b.endTime.split(":")[0], 10)
      if (period === "morning") {
        return startHour < 12
      } else {
        return endHour > 12 || (startHour >= 12)
      }
    })
    return hasBooking ? "approved" : "available"
  }

  // Booking card — clickable
  const BookingCard = ({ b }: { b: Booking }) => {
    const u = users.find((u) => u.id === b.userId)
    return (
      <button
        type="button"
        onClick={() => setInspectingBooking(b)}
        className="w-full text-center space-y-1.5 mb-6 last:mb-0 group cursor-pointer rounded-xl p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
      >
        <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
          {b.purpose}
        </p>
        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          {t.chairman || "ประธาน"}: {formatUserName(u, language)} {formatDepartment(u?.department, u?.role, language)}
        </p>
        <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t.time || "เวลา"} {b.startTime} - {b.endTime} น.
        </p>
        <p className="text-[10px] text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          กดเพื่อดูรายละเอียด →
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

      <div className="relative z-10 p-4 sm:p-8 space-y-10">

        {/* Section 1: Morning/Afternoon Table */}
        <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-slate-800 dark:text-slate-100 drop-shadow-sm">
            วันที่ {formatHeaderDate(currentDate)}
          </h3>

          <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mx-auto max-w-5xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#24272c] dark:bg-[#0f172a] text-white font-semibold">
                  <tr>
                    <th className="px-6 py-4 border-r border-slate-600 dark:border-slate-800 min-w-[250px]">{t.roomBreadcrumb?.split("/")[0] || "ห้องประชุม"}</th>
                    <th className="px-6 py-4 border-r border-slate-600 dark:border-slate-800 text-center whitespace-nowrap w-24">{t.capacity || "ความจุ"}</th>
                    <th className="px-6 py-4 border-r border-slate-600 dark:border-slate-800 text-center w-32">{t.morning || "เช้า"}</th>
                    <th className="px-6 py-4 text-center w-32">{t.afternoon || "บ่าย"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                  {availableRooms.map((room) => {
                    const morningStatus = getRoomStatus(room.id, "morning")
                    const afternoonStatus = getRoomStatus(room.id, "afternoon")
                    const morningBookings = dateBookings.filter(b => b.roomId === room.id && parseInt(b.startTime.split(":")[0], 10) < 12)
                    const afternoonBookings = dateBookings.filter(b => b.roomId === room.id && (parseInt(b.endTime.split(":")[0], 10) >= 12 || (parseInt(b.startTime.split(":")[0], 10) < 12 && parseInt(b.endTime.split(":")[0], 10) > 12)))

                    return (
                      <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-colors">
                        <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700/50">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {formatRoomName(room, language)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatRoomLocation(room.location, language)}
                          </p>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700/50 text-center font-bold text-slate-700 dark:text-slate-300">
                          {room.capacity}
                        </td>
                        <td className="px-2 py-4 border-r border-slate-200 dark:border-slate-700/50 text-center">
                          {morningStatus === "available" ? (
                            <span className="text-emerald-500 font-bold">{t.availableStatus || "ว่าง"}</span>
                          ) : (
                            <div className="space-y-1">
                              {morningBookings.map(b => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setInspectingBooking(b)}
                                  className="inline-block w-full px-3 py-1.5 bg-[#6aa84f] hover:bg-[#4e8a35] text-white rounded-md font-bold shadow-sm transition-colors cursor-pointer text-xs truncate"
                                  title={b.purpose}
                                >
                                  {b.purpose}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-4 text-center">
                          {afternoonStatus === "available" ? (
                            <span className="text-emerald-500 font-bold">{t.availableStatus || "ว่าง"}</span>
                          ) : (
                            <div className="space-y-1">
                              {afternoonBookings.map(b => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setInspectingBooking(b)}
                                  className="inline-block w-full px-3 py-1.5 bg-[#6aa84f] hover:bg-[#4e8a35] text-white rounded-md font-bold shadow-sm transition-colors cursor-pointer text-xs truncate"
                                  title={b.purpose}
                                >
                                  {b.purpose}
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
        <div className="space-y-4 pt-4">
          <div className="bg-[#151f32] dark:bg-[#1a2332] rounded-xl shadow-lg border border-slate-300 dark:border-slate-700 overflow-hidden mx-auto max-w-6xl">
            <div className="bg-[#0f172a] text-white text-center py-4 border-b border-slate-700/50">
              <h3 className="text-lg md:text-xl font-bold">
                วันที่ {formatHeaderDate(currentDate)}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[800px]">
                <thead className="bg-[#1e293b] text-white font-semibold border-b border-slate-700/50">
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
                      const mBookings = dateBookings.filter(b => b.roomId === room.id && parseInt(b.startTime.split(":")[0], 10) < 12)
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
                      const aBookings = dateBookings.filter(b => b.roomId === room.id && (parseInt(b.endTime.split(":")[0], 10) >= 12 || (parseInt(b.startTime.split(":")[0], 10) < 12 && parseInt(b.endTime.split(":")[0], 10) > 12)))

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
