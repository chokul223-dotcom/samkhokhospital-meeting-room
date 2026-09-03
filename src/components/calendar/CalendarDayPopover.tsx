import React, { useRef, useEffect } from "react"
import { Booking } from "../../types"
import { Clock, X } from "lucide-react"

interface CalendarDayPopoverProps {
  date: string
  bookings: Booking[]
  getRoomColor: (roomId: string) => { bgClass: string; textClass: string; dotClass: string }
  onClose: () => void
  onBookingClick: (booking: Booking) => void
  formatHeaderDate: (dStr: string) => string
}

export const CalendarDayPopover: React.FC<CalendarDayPopoverProps> = ({
  date,
  bookings,
  getRoomColor,
  onClose,
  onBookingClick,
  formatHeaderDate,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={popoverRef}
        className="w-full max-w-xs overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {formatHeaderDate(date)}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Booking list */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2">
            การจองทั้งหมด {bookings.length} รายการ
          </p>
          {bookings.map((b) => {
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
                  onBookingClick(b)
                  onClose()
                }}
                className={`w-full text-left rounded-xl px-3 py-2.5 text-xs font-semibold ${roomCol.bgClass} ${roomCol.textClass} shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all block cursor-pointer`}
              >
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 mt-0.5 flex-none opacity-80" />
                  <div className="min-w-0">
                    <div className="font-bold truncate">{timeLabel} — {b.purpose}</div>
                    <div className="opacity-75 text-[10px] mt-0.5">{b.startTime} – {b.endTime} น.</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
