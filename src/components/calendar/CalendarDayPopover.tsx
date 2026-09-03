import React, { useRef, useEffect } from "react"
import { Booking, Room } from "../../types"
import { Clock } from "lucide-react"

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

  // Prevent scroll when popover is active if needed, but not strictly required

  return (
    <div className="absolute z-50 mt-1 min-w-[220px] left-0 md:left-1/2 md:-translate-x-1/2 max-w-[280px]">
      <div 
        ref={popoverRef}
        className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl animate-in zoom-in-95 duration-150"
      >
        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {formatHeaderDate(date)}
          </h4>
        </div>
        <div className="p-2 max-h-[250px] overflow-y-auto space-y-1.5 custom-scrollbar">
          {bookings.map((b) => {
            const roomCol = getRoomColor(b.roomId)
            // Determine time label: เช้า, บ่าย, or ทั้งวัน
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
                }}
                className={`w-full text-left rounded-md px-2 py-1.5 text-xs font-semibold ${roomCol.bgClass} ${roomCol.textClass} shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all block cursor-pointer`}
              >
                <div className="flex items-start gap-1.5">
                  <Clock className="h-3 w-3 mt-0.5 flex-none" />
                  <span className="break-words">
                    {timeLabel} - {b.purpose}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
