import React from "react"
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Booking, Room } from "../../types"
import { useApp } from "../../context/AppContext"
import { Badge } from "../common/Badge"
import { getRoomColor } from "../../constants/roomColors"
import {
  formatRoomName,
  formatRoomLocation,
  formatUserName,
  formatDepartment,
} from "../../constants/translations"

interface BookingDetailModalProps {
  booking: Booking | null
  onClose: () => void
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
}) => {
  const { t, language, rooms, users } = useApp()

  if (!booking) return null

  const room = rooms.find((r) => r.id === booking.roomId)
  const user = users.find((u) => u.id === booking.userId)
  const roomColor = getRoomColor(booking.roomId)

  const formatDisplayDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
        {/* Header with Room Color Accent */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full ${roomColor.dotClass} shadow-xs`}
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.bookingDetail}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatRoomName(room, language)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status & Purpose Banner */}
          <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.purpose}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {booking.purpose}
              </h4>
            </div>
            <Badge status={booking.status} />
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Room & Location */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-none mt-0.5" />
              <div>
                <p className="text-slate-400 font-semibold">{t.room}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatRoomName(room, language)}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatRoomLocation(room?.location, language)}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-none mt-0.5" />
              <div>
                <p className="text-slate-400 font-semibold">{t.timeSlot}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {booking.startTime} – {booking.endTime} น.
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDisplayDate(booking.date)}
                </p>
              </div>
            </div>

            {/* Requester / Organizer */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-none mt-0.5" />
              <div>
                <p className="text-slate-400 font-semibold">{t.createdBy}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatUserName(user, language) || t.staff}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDepartment(user?.department, user?.role, language)}
                </p>
              </div>
            </div>

            {/* Attendees Count */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-none mt-0.5" />
              <div>
                <p className="text-slate-400 font-semibold">{t.attendees}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {booking.attendees} {t.people}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.capacity} {room?.capacity || "-"} {t.people}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection reason if rejected */}
          {booking.status === "rejected" && booking.rejectReason && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="h-4 w-4" />
                <span>{t.rejectedReasonLabel}</span>
              </div>
              <p>{booking.rejectReason}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}
