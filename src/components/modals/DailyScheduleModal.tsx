import React, { useRef, useEffect } from "react"
import { Booking, Room, User, Language } from "../../types"
import { X, ArrowUp } from "lucide-react"
import { formatRoomName, formatRoomLocation, formatUserName, formatDepartment } from "../../constants/translations"

interface DailyScheduleModalProps {
  date: string
  rooms: Room[]
  bookings: Booking[]
  users: User[]
  language: Language
  t: any
  onClose: () => void
  formatHeaderDate: (dStr: string) => string
}

export const DailyScheduleModal: React.FC<DailyScheduleModalProps> = ({
  date,
  rooms,
  bookings,
  users,
  language,
  t,
  onClose,
  formatHeaderDate,
}) => {
  const scheduleRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Filter out maintenance rooms, only show available rooms
  const availableRooms = rooms.filter((r) => r.status === "available")

  // Bookings for this specific date (approved only)
  const dateBookings = bookings.filter(
    (b) => b.date === date && b.status === "approved"
  )

  const scrollToSchedule = () => {
    if (scheduleRef.current) {
      scheduleRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToTop = () => {
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Helper to determine if a room has morning/afternoon booking
  const getRoomStatus = (roomId: string, period: "morning" | "afternoon") => {
    const rBookings = dateBookings.filter((b) => b.roomId === roomId)
    const hasBooking = rBookings.some((b) => {
      const startHour = parseInt(b.startTime.split(":")[0], 10)
      const endHour = parseInt(b.endTime.split(":")[0], 10)
      if (period === "morning") {
        return startHour < 12 // Starts in morning
      } else {
        return endHour > 12 // Ends in afternoon (or starts in afternoon)
      }
    })
    return hasBooking ? "approved" : "available"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar flex flex-col"
      >
        {/* Header Title Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {t.schedule || "กำหนดการ"}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToSchedule}
              className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors hidden sm:block"
            >
              {t.schedule || "กำหนดการ"} ▼
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-12">
          {/* SECTION 1: Daily Room Status Table (Figure 4) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="text-center py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
                วันที่ {formatHeaderDate(date)}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#1e293b] text-white font-semibold">
                  <tr>
                    <th className="px-6 py-4 min-w-[250px]">{t.roomBreadcrumb?.split("/")[0] || "ห้องประชุม"}</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">{t.capacity || "ความจุ"}</th>
                    <th className="px-6 py-4 text-center">{t.morning || "เช้า"}</th>
                    <th className="px-6 py-4 text-center">{t.afternoon || "บ่าย"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {availableRooms.map((room) => {
                    const morningStatus = getRoomStatus(room.id, "morning")
                    const afternoonStatus = getRoomStatus(room.id, "afternoon")
                    
                    return (
                      <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {formatRoomName(room, language)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatRoomLocation(room.location, language)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">
                          {room.capacity}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {morningStatus === "available" ? (
                            <span className="text-emerald-500 font-bold">{t.availableStatus || "ว่าง"}</span>
                          ) : (
                            <span className="inline-block px-4 py-1.5 bg-[#6aa84f] text-white rounded-md font-bold shadow-sm">
                              {t.approvedStatus || "อนุมัติ"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {afternoonStatus === "available" ? (
                            <span className="text-emerald-500 font-bold">{t.availableStatus || "ว่าง"}</span>
                          ) : (
                            <span className="inline-block px-4 py-1.5 bg-[#6aa84f] text-white rounded-md font-bold shadow-sm">
                              {t.approvedStatus || "อนุมัติ"}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Detailed Schedule Agenda Table (Figure 5) */}
          <div ref={scheduleRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#091e36] text-white text-center py-4 border-b border-[#132c4d]">
              <h3 className="text-lg md:text-xl font-bold">
                วันที่ {formatHeaderDate(date)}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[800px]">
                <thead className="bg-[#0f2744] text-white font-semibold border-b-2 border-[#1a385b]">
                  <tr>
                    <th className="px-4 py-3 border-r border-[#1a385b] text-center w-20">{t.time || "เวลา"}</th>
                    {availableRooms.map(room => (
                      <th key={room.id} className="px-4 py-3 border-r border-[#1a385b] text-center min-w-[200px]">
                        {formatRoomName(room, language)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                  {/* Morning Row */}
                  <tr>
                    <td className="bg-[#0f2744] text-white text-center font-bold px-2 py-4 border-r border-[#1a385b] align-top">
                      {t.morning || "เช้า"}
                    </td>
                    {availableRooms.map(room => {
                      const mBookings = dateBookings.filter(b => b.roomId === room.id && parseInt(b.startTime.split(":")[0], 10) < 12)
                      return (
                        <td key={room.id} className="p-4 border-r border-slate-200 dark:border-slate-700 align-top bg-slate-50/30 dark:bg-slate-800/30">
                          {mBookings.length > 0 ? mBookings.map(b => {
                            const u = users.find(u => u.id === b.userId)
                            return (
                              <div key={b.id} className="text-center space-y-1 mb-4 last:mb-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{b.purpose}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {t.chairman || "ประธาน"}: {formatUserName(u, language)} {formatDepartment(u?.department, u?.role, language)}
                                </p>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {t.time || "เวลา"} {b.startTime} - {b.endTime} น.
                                </p>
                              </div>
                            )
                          }) : null}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Lunch Break Divider */}
                  <tr>
                    <td colSpan={availableRooms.length + 1} className="bg-[#0a2540] text-white text-center py-2 font-bold text-sm tracking-widest shadow-inner border-y border-[#1a385b]">
                      {t.lunchBreak || "พักเที่ยง"}
                    </td>
                  </tr>

                  {/* Afternoon Row */}
                  <tr>
                    <td className="bg-[#0f2744] text-white text-center font-bold px-2 py-4 border-r border-[#1a385b] align-top">
                      {t.afternoon || "บ่าย"}
                    </td>
                    {availableRooms.map(room => {
                      const aBookings = dateBookings.filter(b => b.roomId === room.id && parseInt(b.endTime.split(":")[0], 10) > 12)
                      return (
                        <td key={room.id} className="p-4 border-r border-slate-200 dark:border-slate-700 align-top bg-slate-50/30 dark:bg-slate-800/30">
                          {aBookings.length > 0 ? aBookings.map(b => {
                            const u = users.find(u => u.id === b.userId)
                            return (
                              <div key={b.id} className="text-center space-y-1 mb-4 last:mb-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{b.purpose}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {t.chairman || "ประธาน"}: {formatUserName(u, language)} {formatDepartment(u?.department, u?.role, language)}
                                </p>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {t.time || "เวลา"} {b.startTime} - {b.endTime} น.
                                </p>
                              </div>
                            )
                          }) : null}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Scroll to Top floating button inside modal */}
        <button
          onClick={scrollToTop}
          className="sticky bottom-6 left-[calc(100%-4rem)] ml-auto mr-6 flex items-center justify-center w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          title="กลับขึ้นด้านบน"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
