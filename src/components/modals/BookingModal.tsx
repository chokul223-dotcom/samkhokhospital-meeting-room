import React, { useState, useMemo } from "react"
import {
  X,
  Calendar,
  Clock,
  Users,
  Building,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Room, Booking } from "../../types"
import { useApp } from "../../context/AppContext"

interface BookingModalProps {
  initialRoomId?: string
  initialDate?: string
  onClose: () => void
}

export const BookingModal: React.FC<BookingModalProps> = ({
  initialRoomId,
  initialDate,
  onClose,
}) => {
  const { t, rooms, bookings, currentUser, handleBookingSubmit } = useApp()

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "available"),
    [rooms],
  )
  const todayStr = new Date().toISOString().split("T")[0]

  const [roomId, setRoomId] = useState(
    initialRoomId || (availableRooms.length > 0 ? availableRooms[0].id : ""),
  )
  const [date, setDate] = useState(initialDate || todayStr)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("11:00")
  const [attendees, setAttendees] = useState(10)
  const [purpose, setPurpose] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRoom = rooms.find((r) => r.id === roomId)

  // Realtime Conflict Detection
  const conflicts = useMemo(() => {
    return bookings.filter((b) => {
      if (
        b.roomId !== roomId ||
        b.date !== date ||
        b.status === "rejected" ||
        b.status === "cancelled"
      )
        return false

      const toMins = (t: string) => {
        const [h, m] = t.split(":").map(Number)
        return h * 60 + m
      }
      let bStart = toMins(b.startTime)
      let bEnd = toMins(b.endTime)
      let newStart = toMins(startTime)
      let newEnd = toMins(endTime)

      if (bEnd <= bStart) bEnd += 24 * 60
      if (newEnd <= newStart) newEnd += 24 * 60

      return newStart < bEnd && bStart < newEnd
    })
  }, [bookings, roomId, date, startTime, endTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!purpose.trim()) {
      setError(t.errPurpose)
      return
    }
    if (startTime >= endTime) {
      setError(t.errTime)
      return
    }
    if (conflicts.length > 0) {
      setError(t.conflictWarning)
      return
    }
    if (selectedRoom && attendees > selectedRoom.capacity) {
      setError(`${t.errCapacity} (${selectedRoom.capacity} ${t.people})`)
      return
    }

    setIsSubmitting(true)
    try {
      await handleBookingSubmit({
        roomId,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
        attendees,
      })
      onClose()
    } catch (err: any) {
      if (err.message === "Time slot conflict") {
        setError(t.conflictWarning)
      } else {
        setError(err.message || "เกิดข้อผิดพลาดในการส่งคำขอจอง")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.bookRoom}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.appName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Room Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.room} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.capacity} {t.people}) — {r.location}
                  </option>
                ))}
              </select>
              <Building className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Selected Room Info & Equipment */}
          {selectedRoom && (
            <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3.5 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span>{selectedRoom.location}</span>
                <span>
                  รองรับสูงสุด {selectedRoom.capacity} {t.people}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedRoom.equipment.map((eq, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:text-blue-300"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.date} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.startTime} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Clock className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.endTime} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Clock className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.attendees} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={selectedRoom ? selectedRoom.capacity : 200}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Users className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.purpose} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={t.purposePlaceholder}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-shake">
              <AlertCircle className="h-5 w-5 flex-none mt-0.5" />
              <div>
                <p className="text-xs font-bold">{t.conflictWarning}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                  มีการจองแล้ว:{" "}
                  {conflicts
                    .map((c) => `${c.startTime}–${c.endTime} (${c.purpose})`)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || conflicts.length > 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.submitting : t.submitBooking}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default BookingModal
