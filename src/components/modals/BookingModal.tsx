import React, { useState, useMemo } from 'react'
import { X, Calendar, AlertCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Room } from '../../types'
import { useApp } from '../../context/AppContext'
import {
  formatRoomName,
  formatRoomLocation,
  formatEquipment,
} from '../../constants/translations'
import { getRoomImage } from '../../constants/roomColors'

interface BookingModalProps {
  initialRoomId?: string
  initialDate?: string
  onClose: () => void
}

// ─── Month & Day Names (Thai / English) ─────────────────────────────────────────
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const ENG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const ENG_DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Localized Mini Date Picker ───────────────────────────────────────────────
interface DatePickerProps {
  value: string // YYYY-MM-DD
  min: string
  onChange: (v: string) => void
  lang: 'th' | 'en'
}

const LocalizedDatePicker: React.FC<DatePickerProps> = ({ value, min, onChange, lang }) => {
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(min + 'T00:00:00')

  const monthNames = lang === 'th' ? THAI_MONTHS : ENG_MONTHS
  const dayNames = lang === 'th' ? THAI_DAYS_SHORT : ENG_DAYS_SHORT

  const displayText = value
    ? lang === 'th'
      ? `${selected.getDate()} ${THAI_MONTHS[selected.getMonth()]} ${selected.getFullYear() + 543}`
      : `${ENG_MONTHS[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}`
    : lang === 'th' ? 'เลือกวันที่' : 'Select Date'

  const headerMonthYear = lang === 'th'
    ? `${THAI_MONTHS[viewMonth]} ${viewYear + 543}`
    : `${ENG_MONTHS[viewMonth]} ${viewYear}`

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const selectDay = (d: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
  }

  const isDisabled = (d: number) => {
    const dt = new Date(viewYear, viewMonth, d)
    return dt < minDate
  }
  const isSelected = (d: number) => {
    if (!value) return false
    const dt = new Date(viewYear, viewMonth, d)
    return dt.toDateString() === selected.toDateString()
  }
  const isToday = (d: number) => {
    const dt = new Date(viewYear, viewMonth, d)
    return dt.toDateString() === today.toDateString()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
      >
        <span>{displayText}</span>
        <Calendar className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {headerMonthYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => (
              <div key={i} className="flex items-center justify-center">
                {d ? (
                  <button
                    type="button"
                    disabled={isDisabled(d)}
                    onClick={() => selectDay(d)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${isSelected(d)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isToday(d)
                          ? 'border border-blue-400 text-blue-600 dark:text-blue-400'
                          : isDisabled(d)
                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {d}
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                const tDate = new Date()
                onChange(`${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`)
                setViewYear(tDate.getFullYear())
                setViewMonth(tDate.getMonth())
                setOpen(false)
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {lang === 'th' ? 'วันนี้' : 'Today'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 24-Hour Time Selector ────────────────────────────────────────────────────
interface TimeSelect24Props {
  value: string // "HH:MM"
  onChange: (val: string) => void
}
const TimeSelect24: React.FC<TimeSelect24Props> = ({ value, onChange }) => {
  const [h, m] = value.split(':').map(Number)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]
  const selectClass =
    'rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer'
  return (
    <div className="flex items-center gap-2">
      <select
        value={isNaN(h) ? 9 : h}
        onChange={e => {
          const newH = Number(e.target.value)
          const newM = isNaN(m) ? 0 : m
          onChange(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`)
        }}
        className={selectClass}
      >
        {hours.map(hh => (
          <option key={hh} value={hh}>
            {String(hh).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">:</span>
      <select
        value={isNaN(m) ? 0 : m}
        onChange={e => {
          const newM = Number(e.target.value)
          const newH = isNaN(h) ? 9 : h
          onChange(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`)
        }}
        className={selectClass}
      >
        {minutes.map(mm => (
          <option key={mm} value={mm}>
            {String(mm).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Main BookingModal ─────────────────────────────────────────────────────────
export const BookingModal: React.FC<BookingModalProps> = ({
  initialRoomId,
  initialDate,
  onClose,
}) => {
  const { t, language, rooms, bookings, handleBookingSubmit, currentUser } = useApp()

  const availableRooms = useMemo(() => rooms.filter(r => r.status === 'available'), [rooms])
  const todayStr = new Date().toISOString().split('T')[0]

  const [roomId, setRoomId] = useState(
    initialRoomId || (availableRooms.length > 0 ? availableRooms[0].id : '')
  )
  const [date, setDate] = useState(initialDate || todayStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:00')
  const [attendees, setAttendees] = useState(10)
  const [purpose, setPurpose] = useState('')
  const [chairman, setChairman] = useState('')
  const [onlineMeeting, setOnlineMeeting] = useState('none')
  const [onlineMeetingOther, setOnlineMeetingOther] = useState('')
  const [contactPerson, setContactPerson] = useState(currentUser?.name || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRoom = rooms.find(r => r.id === roomId)

  // Realtime Conflict Detection
  const conflicts = useMemo(() => {
    return bookings.filter(b => {
      if (
        b.roomId !== roomId ||
        b.date !== date ||
        b.status !== 'approved'
      )
        return false

      const toMins = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number)
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

  // Real-time room maintenance check — show error immediately without submit
  const isRoomMaintenance = selectedRoom?.status === 'maintenance'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!purpose.trim()) {
      setError(t.errPurpose)
      return
    }
    if (startTime >= endTime) {
      setError(t.errTime)
      return
    }

    const now = new Date()
    const selectedDateTime = new Date(`${date}T${startTime}:00`)
    if (selectedDateTime < now) {
      setError(language === 'th' ? 'ไม่สามารถจองเวลาย้อนหลังได้' : 'Cannot book a time in the past')
      return
    }

    if (isRoomMaintenance) {
      setError(language === 'th' ? 'ห้องนี้ถูกปิดปรับปรุงชั่วคราว ไม่สามารถจองได้' : 'This room is under maintenance and cannot be booked')
      return
    }

    if (conflicts.length > 0) {
      setError(t.conflictWarning)
      return
    }
    // Validate 'อื่นๆ' must have detail
    if (onlineMeeting === 'other' && !onlineMeetingOther.trim()) {
      setError(language === 'th' ? 'กรุณาระบุชื่อระบบออนไลน์ที่ต้องการใช้' : 'Please specify the online meeting system')
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
        chairman: chairman.trim(),
        onlineMeeting: onlineMeeting === 'other'
          ? onlineMeetingOther.trim()
          : onlineMeeting === 'none' ? '' : onlineMeeting.trim(),
        contactPerson: contactPerson.trim(),
      })
      onClose()
    } catch (err: any) {
      if (err.message === 'Time slot conflict') {
        setError(t.conflictWarning)
      } else {
        setError(err.message || (language === 'th' ? 'เกิดข้อผิดพลาดในการส่งคำขอจอง' : 'Failed to submit booking request'))
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
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        {(() => {
          const dept = currentUser?.department
          const isPendingUser = !dept || dept === "" || dept === "-" || dept === "รอการตรวจสอบ"
          return isPendingUser
        })() ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[300px]">
            <img src="/logo.png" alt="Hospital Logo" className="h-20 w-20 object-contain mb-4 drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-6">ระบบจองห้องประชุมโรงพยาบาลสามโคก</h2>
            <div className="w-full max-w-sm rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-5 text-center shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">
                บัญชียังรอการอนุมัติ
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                กรุณาติดต่อผู้ดูแลระบบ (Admin)<br />เพื่อขอสิทธิ์ก่อนจองห้องประชุม
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Room Selection */}
            <div>
              {/* Room image preview */}
              {selectedRoom && (() => {
                const roomIndex = availableRooms.findIndex(r => r.id === roomId)
                const imgSrc = selectedRoom.imageUrl || getRoomImage(roomId, roomIndex)
                return (
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-200 dark:bg-slate-700 relative">
                    <img
                      src={imgSrc}
                      alt={formatRoomName(selectedRoom, language)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow">
                      {formatRoomName(selectedRoom, language)}
                    </p>
                  </div>
                )
              })()}
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.room} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-3 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {formatRoomName(r, language)} ({r.capacity} {t.people}) — {formatRoomLocation(r.location, language)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Selected Room Info & Equipment */}
            {selectedRoom && (
              <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3.5 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span>{formatRoomLocation(selectedRoom.location, language)}</span>
                  <span>{t.maxCapacity} {selectedRoom.capacity} {t.people}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRoom.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-lg bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:text-blue-300"
                    >
                      {formatEquipment(eq, language)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selector — Localized Calendar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.date} <span className="text-rose-500">*</span>
              </label>
              <LocalizedDatePicker value={date} min={todayStr} onChange={setDate} lang={language} />
            </div>

            {/* Time Slot — 24-Hour Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.startTime} <span className="text-rose-500">*</span>
                </label>
                <TimeSelect24 value={startTime} onChange={setStartTime} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.endTime} <span className="text-rose-500">*</span>
                </label>
                <TimeSelect24 value={endTime} onChange={setEndTime} />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.attendees} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={selectedRoom ? selectedRoom.capacity : 200}
                value={attendees}
                onChange={e => setAttendees(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.purpose} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder={t.purposePlaceholder}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            {/* Chairman */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {language === 'th' ? 'ประธานการประชุม' : 'Chairman'}
              </label>
              <input
                type="text"
                value={chairman}
                onChange={e => setChairman(e.target.value)}
                placeholder={language === 'th' ? 'ระบุชื่อ-นามสกุล หรือตำแหน่งประธาน' : 'Chairman Name or Position'}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Online Meeting System */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {language === 'th' ? 'ระบบออนไลน์ที่ต้องการใช้' : 'Online Meeting System'}
              </label>
              <div className="relative">
                <select
                  value={onlineMeeting}
                  onChange={e => setOnlineMeeting(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="none">{language === 'th' ? 'ไม่ใช้ระบบออนไลน์' : 'None'}</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="WebEx">WebEx</option>
                  <option value="MS Teams">MS Teams</option>
                  <option value="other">{language === 'th' ? 'อื่นๆ (โปรดระบุในรายละเอียด)' : 'Other (specify in details)'}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* อื่นๆ — specify field */}
            {onlineMeeting === 'other' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {language === 'th' ? 'โปรดระบุระบบออนไลน์' : 'Specify Online System'}
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={onlineMeetingOther}
                  onChange={e => setOnlineMeetingOther(e.target.value)}
                  placeholder={language === 'th' ? 'เช่น Line, Skype, Cisco Webex...' : 'e.g. Line, Skype, Cisco Webex...'}
                  className={`w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    !onlineMeetingOther.trim()
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  autoFocus
                />
                {!onlineMeetingOther.trim() && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {language === 'th' ? '* กรุณาระบุชื่อระบบออนไลน์' : '* Please specify the system name'}
                  </p>
                )}
              </div>
            )}

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {language === 'th' ? 'ประสานงานผ่าน (ชื่อ / เบอร์โทร)' : 'Contact Person (Name / Phone)'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder={language === 'th' ? 'เช่น สมหญิง เบอร์ 1234' : 'e.g. Jane, Ext 1234'}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Room Maintenance Warning — Real-time */}
            {isRoomMaintenance && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 flex items-start gap-3 text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-5 w-5 flex-none mt-0.5" />
                <div>
                  <p className="text-xs font-bold">
                    {language === 'th' ? '⚠️ ห้องถูกปิดปรับปรุงชั่วคราว' : '⚠️ Room under maintenance'}
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    {language === 'th'
                      ? 'ผู้ดูแลระบบได้ปิดห้องนี้ชั่วคราว ไม่สามารถทำการจองได้ในขณะนี้'
                      : 'The admin has closed this room temporarily. Booking is not available.'}
                  </p>
                </div>
              </div>
            )}

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 flex items-start gap-3 text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-5 w-5 flex-none mt-0.5" />
                <div>
                  <p className="text-xs font-bold">{t.conflictWarning}</p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                    {language === 'th' ? 'มีการจองแล้ว:' : 'Already booked:'}{' '}
                    {conflicts.map(c => `${c.startTime}–${c.endTime} (${c.purpose})`).join(', ')}
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
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || conflicts.length > 0 || isRoomMaintenance}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? t.submitting : t.submitBooking}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
export default BookingModal
