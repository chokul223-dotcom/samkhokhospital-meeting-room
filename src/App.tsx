import { useState, useMemo, useEffect, createContext, useContext } from 'react'
import { Language, useTranslation } from './Language'
import * as api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'admin' | 'user'
type ThemeOption = 'light' | 'dark'

interface User {
  id: string
  name: string
  department: string
  role: Role
  username: string
  password?: string
}

interface Room {
  id: string
  name: string
  capacity: number
  location: string
  equipment: string[]
  status: 'available' | 'maintenance'
}

interface Booking {
  id: string
  roomId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  note?: string
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<{
  t: ReturnType<typeof useTranslation>;
  language: Language;
  theme: ThemeOption;
  setLanguage: (l: Language) => void;
  setTheme: (t: ThemeOption) => void;
}>({} as any)

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'ผู้ดูแลระบบ', department: '-', role: 'admin', username: 'Admin', password: 'Admin123456' },
  { id: 'u2', name: 'ทั่วไป', department: '-', role: 'user', username: 'Test', password: 'Test123456' },
]

const ROOMS: Room[] = [
  { id: 'r1', name: 'ห้องประชุมใหญ่', capacity: 50, location: 'อาคาร A ชั้น 2', equipment: ['โปรเจคเตอร์', 'ไมโครโฟน', 'จอภาพ', 'ระบบเสียง'], status: 'available' },
  { id: 'r2', name: 'ห้องประชุมเล็ก 1', capacity: 15, location: 'อาคาร A ชั้น 1', equipment: ['โปรเจคเตอร์', 'กระดานไวท์บอร์ด'], status: 'available' },
  { id: 'r3', name: 'ห้องประชุมเล็ก 2', capacity: 20, location: 'อาคาร B ชั้น 3', equipment: ['โปรเจคเตอร์', 'กระดานไวท์บอร์ด', 'วิดีโอคอนเฟอเรนซ์'], status: 'available' },
  { id: 'r4', name: 'ห้องอบรม', capacity: 80, location: 'อาคาร C ชั้น 1', equipment: ['โปรเจคเตอร์ x2', 'ไมโครโฟน', 'จอภาพ', 'ระบบเสียง', 'เวที'], status: 'available' },
  { id: 'r5', name: 'ห้องประชุม VIP', capacity: 10, location: 'อาคาร A ชั้น 3', equipment: ['โทรทัศน์', 'วิดีโอคอนเฟอเรนซ์', 'กาแฟ/น้ำดื่ม'], status: 'maintenance' },
]

const TODAY = new Date().toISOString().split('T')[0]
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'r1', userId: 'u2', date: TODAY, startTime: '09:00', endTime: '11:00', purpose: 'ประชุมคณะแพทย์ประจำเดือน', attendees: 30, status: 'approved', createdAt: TODAY },
  { id: 'b2', roomId: 'r2', userId: 'u3', date: TODAY, startTime: '13:00', endTime: '15:00', purpose: 'ประชุมทีมพยาบาล', attendees: 12, status: 'pending', createdAt: TODAY },
  { id: 'b3', roomId: 'r3', userId: 'u4', date: TOMORROW, startTime: '10:00', endTime: '12:00', purpose: 'อบรมการใช้ยาใหม่', attendees: 18, status: 'approved', createdAt: TODAY },
  { id: 'b4', roomId: 'r4', userId: 'u2', date: TOMORROW, startTime: '14:00', endTime: '16:00', purpose: 'สัมมนาประจำปี', attendees: 60, status: 'pending', createdAt: TODAY },
  { id: 'b5', roomId: 'r2', userId: 'u3', date: TODAY, startTime: '08:00', endTime: '09:00', purpose: 'ประชุมเช้า Standup', attendees: 8, status: 'approved', createdAt: TODAY },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  approved: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

function genId() { return 'b' + Date.now() }

function formatDate(d: string, lang: Language) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ status }: { status: Booking['status'] }) {
  const { t } = useContext(AppContext)
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[status]}`}>
      {t[status]}
    </span>
  )
}

function Stat({ label, value, icon, color, onClick }: { label: string; value: number | string; icon: string; color: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 ${onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LanguageSwitcher() {
  const { language, setLanguage } = useContext(AppContext)
  const [open, setOpen] = useState(false)

  const options = [
    { value: 'th' as Language, label: 'ไทย', flagSrc: 'https://flagcdn.com/w40/th.png' },
    { value: 'en' as Language, label: 'English', flagSrc: 'https://flagcdn.com/w40/gb.png' },
  ]
  const current = options.find(o => o.value === language)!

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-full px-3.5 py-2 text-sm font-medium shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all"
      >
        <img src={current.flagSrc} alt={current.label} className="w-5 h-auto rounded-sm shadow-sm" />
        <span>Language</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden min-w-[160px] py-1">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setLanguage(opt.value); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  language === opt.value
                    ? 'bg-emerald-500 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <img src={opt.flagSrc} alt={opt.label} className="w-6 h-auto rounded-sm shadow-sm" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => void }) {
  const { t } = useContext(AppContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)

  const backgrounds = [
    '/backgrounds/Picture 1.jpg',
    '/backgrounds/Picture 2.jpg',
    '/backgrounds/Picture 3.png',
    '/backgrounds/Picture 4.jpg',
    '/backgrounds/Picture 5.jpg',
    '/backgrounds/Picture 6.jpg',
    '/backgrounds/Picture 7.jpg',
    '/backgrounds/Picture 8.jpg'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Slideshow */}
      {backgrounds.map((bg, idx) => (
        <div 
          key={bg}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === bgIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${bg}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-colors" />

      {/* Language Switcher – top right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Hospital Logo" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-sm" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.loginTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.appName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mb-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.username}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a5fa8] focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a5fa8] focus:border-transparent transition-all" />
            <div className="text-right mt-2">
              <button type="button" onClick={() => alert(t.contactAdmin)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#1a5fa8] dark:hover:text-blue-400 transition-colors">{t.forgotPassword}</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#1a5fa8] hover:bg-[#134a86] text-white font-bold py-3 rounded-xl transition-colors shadow-md mt-4">
            {t.loginBtn}
          </button>
        </form>
      </div>

      {/* Floating Video Player (Clickable) */}
      <div 
        onClick={() => setIsVideoModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-72 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/20 dark:border-slate-700/50 bg-black/5 backdrop-blur-md cursor-pointer transition-transform hover:scale-105 duration-300 group"
      >
        <div className="relative pt-[56.25%] bg-slate-900">
          <video
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src="/video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12">
          <button 
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            ✕
          </button>
          <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
            <video
              className="w-full h-full object-contain"
              src="/video.mp4"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({
  rooms, userId, bookings, onClose, onSubmit
}: {
  rooms: Room[]
  userId: string
  bookings: Booking[]
  onClose: () => void
  onSubmit: (b: Booking) => void
}) {
  const { t } = useContext(AppContext)
  const [roomId, setRoomId] = useState(rooms.find(r => r.status === 'available')?.id || '')
  const [date, setDate] = useState(TODAY)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [purpose, setPurpose] = useState('')
  const [attendees, setAttendees] = useState(10)
  const [error, setError] = useState('')

  const availableRooms = rooms.filter(r => r.status === 'available')
  const selectedRoom = rooms.find(r => r.id === roomId)

  const conflicts = bookings.filter(b =>
    b.roomId === roomId && b.date === date && b.status !== 'rejected' && b.status !== 'cancelled' &&
    !(endTime <= b.startTime || startTime >= b.endTime)
  )

  function handleSubmit() {
    if (!purpose.trim()) { setError(t.errPurpose); return }
    if (startTime >= endTime) { setError(t.errTime); return }
    if (conflicts.length > 0) { setError(t.errConflict); return }
    if (selectedRoom && attendees > selectedRoom.capacity) { setError(`${t.errCapacity} (${selectedRoom.capacity} ${t.people})`); return }
    onSubmit({ id: genId(), roomId, userId, date, startTime, endTime, purpose, attendees, status: 'pending', createdAt: TODAY })
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.bookRoom}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.room}</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              {availableRooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.capacity} {t.people}) - {r.location}</option>
              ))}
            </select>
          </div>
          {selectedRoom && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              <p className="font-medium mb-1">{t.equipmentInRoom}</p>
              <p>{selectedRoom.equipment.join(', ')}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.date}</label>
            <input type="date" value={date} min={TODAY} onChange={e => setDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.startTime}</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.endTime}</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
          </div>
          {conflicts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
              {t.conflictWarning}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.attendees}</label>
            <input type="number" value={attendees} min={1} onChange={e => setAttendees(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.purpose} <span className="text-red-400">*</span></label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3} placeholder={t.purposePlaceholder}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors" />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg p-2">{error}</p>}
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">{t.cancelBtn}</button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#1a5fa8] text-white text-sm font-medium hover:bg-[#134a86] transition-colors">{t.submitBooking}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Room Modal ───────────────────────────────────────────────────────────────

function RoomModal({
  room, onClose, onSubmit
}: {
  room?: Room
  onClose: () => void
  onSubmit: (r: Room) => void
}) {
  const { t } = useContext(AppContext)
  const [name, setName] = useState(room?.name || '')
  const [capacity, setCapacity] = useState(room?.capacity || 10)
  const [location, setLocation] = useState(room?.location || '')
  const [equipment, setEquipment] = useState(room?.equipment.join(', ') || '')
  const [status, setStatus] = useState<'available' | 'maintenance'>(room?.status || 'available')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) { setError(t.errRoomName); return }
    if (!location.trim()) { setError(t.errLocation); return }
    if (capacity < 1) { setError(t.errCapacityZero); return }

    onSubmit({
      id: room?.id || ('r' + Date.now()),
      name: name.trim(),
      capacity,
      location: location.trim(),
      equipment: equipment.split(',').map(e => e.trim()).filter(Boolean),
      status
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{room ? t.editRoom : t.addRoom}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.roomName} <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.location} <span className="text-red-400">*</span></label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.capacity} ({t.people}) <span className="text-red-400">*</span></label>
              <input type="number" value={capacity} min={1} onChange={e => setCapacity(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.equipmentList}</label>
            <input type="text" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder={t.equipmentExample}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.roomStatusLabel}</label>
            <select value={status} onChange={e => setStatus(e.target.value as 'available' | 'maintenance')}
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <option value="available">{t.available}</option>
              <option value="maintenance">{t.maintenance}</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg p-2">{error}</p>}
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">{t.cancelBtn}</button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#1a5fa8] text-white text-sm font-medium hover:bg-[#134a86] transition-colors">{t.save}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function SettingsScreen() {
  const { t, language, setLanguage } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)

  const langOptions = [
    { value: 'th' as Language, label: 'ภาษาไทย (Thai)' },
    { value: 'en' as Language, label: 'English (United States)' },
  ]

  return (
    <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg">
      <div className="bg-gray-200/80 dark:bg-slate-800 px-5 py-2.5 border-b border-gray-300/80 dark:border-slate-700 rounded-t-lg">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Languages</h2>
      </div>
      
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="group cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between p-5"
        >
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">{t.language || 'Language'}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
              {language === 'th' ? 'ภาษาไทย (Thai)' : 'English (United States)'}
            </div>
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            <svg className="w-5 h-5 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full left-0 right-0 z-20 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in">
              {langOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                    language === opt.value
                      ? 'bg-blue-50 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => {
                    setLanguage(opt.value)
                    setIsOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <svg className="w-3.5 h-3.5 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {language === 'th' ? 'การตั้งค่าถูกบันทึกอัตโนมัติ' : 'Settings are saved automatically'}
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'th')
  const [theme, setTheme] = useState<ThemeOption>(() => { const saved = localStorage.getItem('theme'); return saved === 'dark' ? 'dark' : 'light' })
  
  const t = useTranslation(language)

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Context value
  const contextValue = useMemo(() => ({ t, language, theme, setLanguage, setTheme }), [t, language, theme])

  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getSavedUser())
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)

  // Load data from API when user is logged in
  async function refreshData() {
    if (!api.getSavedUser()) return
    setLoading(true)
    try {
      const [b, r, u] = await Promise.all([
        api.fetchBookings(),
        api.fetchRooms(),
        api.getSavedUser()?.role === 'admin' ? api.fetchUsers() : Promise.resolve([])
      ])
      setBookings(b)
      setRooms(r)
      if (Array.isArray(u)) setUsers(u)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) refreshData()
  }, [currentUser])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState('')
  const [calendarDate, setCalendarDate] = useState(TODAY)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const isAdmin = currentUser?.role === 'admin'

  const myBookings = isAdmin ? bookings : bookings.filter(b => b.userId === currentUser?.id)

  const filteredBookings = useMemo(() => {
    return myBookings.filter(b => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false
      if (filterDate && b.date !== filterDate) return false
      return true
    })
  }, [myBookings, filterStatus, filterDate])

  const calendarBookings = bookings.filter(b => b.date === calendarDate && b.status !== 'rejected' && b.status !== 'cancelled')

  async function handleBookingSubmit(b: Booking) {
    try {
      const created = await api.createBooking({
        roomId: b.roomId, date: b.date, startTime: b.startTime,
        endTime: b.endTime, purpose: b.purpose, attendees: b.attendees
      })
      setBookings(prev => [created, ...prev])
      setShowBookingModal(false)
      showToast(t.toastBookingSuccess)
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาด')
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.updateBookingStatus(id, 'approved')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b))
      showToast(t.toastApproveSuccess)
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด') }
  }

  async function handleReject(id: string) {
    try {
      await api.updateBookingStatus(id, 'rejected')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b))
      showToast(t.toastRejectSuccess)
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด') }
  }

  async function handleCancel(id: string) {
    try {
      await api.updateBookingStatus(id, 'cancelled')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      showToast(t.toastCancelSuccess)
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด') }
  }

  async function handleSaveRoom(r: Room) {
    const wasEditing = !!editingRoom
    try {
      if (wasEditing) {
        await api.editRoom(r.id, r)
      } else {
        await api.addRoom(r)
      }
      setRooms(prev => {
        const idx = prev.findIndex(room => room.id === r.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = r
          return next
        }
        return [...prev, r]
      })
      setShowRoomModal(false)
      setEditingRoom(undefined)
      showToast(wasEditing ? t.toastRoomEdited : t.toastRoomAdded)
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาด')
    }
  }

  async function handleDeleteRoom(id: string) {
    if (window.confirm(t.confirmDeleteRoom)) {
      try {
        await api.deleteRoom(id)
        setRooms(prev => prev.filter(r => r.id !== id))
        showToast(t.toastRoomDeleted)
      } catch (err: any) {
        showToast(err.message || 'เกิดข้อผิดพลาด')
      }
    }
  }

  const isDark = theme === 'dark'

  return (
    <AppContext.Provider value={contextValue}>
      {/* ── Floating theme toggle – always visible ── */}
      {/* Mobile: icon only | Desktop: icon + label */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`fixed bottom-6 right-4 z-[100] flex items-center overflow-hidden rounded-full shadow-xl border-2 transition-all duration-300 select-none
          ${ isDark
            ? 'bg-[#0f1f3d] border-[#1a3a6e] text-white md:w-44 w-12'
            : 'bg-white border-slate-200 text-slate-800 md:w-44 w-12'
          }`}
      >
        {isDark ? (
          <>
            <span className="hidden md:block flex-1 text-center text-xs font-bold tracking-wide pl-3 py-3">
              {language === 'th' ? 'โหมดมืด' : 'DARK MODE'}
            </span>
            <span className="w-12 h-12 md:w-14 md:h-14 flex-none rounded-full bg-[#1a3a8f] flex items-center justify-center text-xl shadow-inner">
              🌙
            </span>
          </>
        ) : (
          <>
            <span className="w-12 h-12 md:w-14 md:h-14 flex-none rounded-full bg-sky-100 flex items-center justify-center text-xl shadow-inner">
              ☀️
            </span>
            <span className="hidden md:block flex-1 text-center text-xs font-bold tracking-wide pr-3 py-3">
              {language === 'th' ? 'โหมดสว่าง' : 'LIGHT MODE'}
            </span>
          </>
        )}
      </button>

      {!currentUser ? (
        <LoginScreen onLogin={async (u, p) => {
          try {
            const res = await api.login(u, p)
            setCurrentUser(res.user as any)
          } catch {
            alert(t.invalidLogin)
          }
        }} />
      ) : (
        <div className="min-h-screen bg-[#f0f4f9] dark:bg-slate-950 flex transition-colors text-slate-800 dark:text-slate-100 overflow-x-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-[#1a5fa8] dark:bg-[#0f3c6e] text-white flex flex-col min-h-screen shadow-xl hidden md:flex transition-colors">
            <div
              className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Hospital Logo" className="w-10 h-10 object-contain rounded-xl" />
                <div>
                  <p className="font-bold text-sm leading-tight">{t.appName}</p>
                  <p className="text-white/60 text-xs">{t.appDesc}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {[
                { id: 'dashboard', label: t.dashboard, icon: '📊' },
                { id: 'calendar', label: t.calendar, icon: '📅' },
                { id: 'bookings', label: isAdmin ? t.allBookings : t.myBookings, icon: '📋' },
                ...(isAdmin ? [{ id: 'rooms', label: t.rooms, icon: '🚪' }] : []),
                ...(isAdmin ? [{ id: 'users', label: t.users, icon: '👥' }] : []),
                { id: 'settings', label: t.settings, icon: '⚙️' },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                  <span>{item.icon}</span>
                  {item.label}
                  {item.id === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && isAdmin && (
                    <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{bookings.filter(b => b.status === 'pending').length}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-white/60">{isAdmin ? t.admin : t.user}</p>
                </div>
              </div>
              <button onClick={() => setCurrentUser(null)}
                className="w-full text-center text-xs text-white/60 hover:text-white py-2 rounded-lg hover:bg-white/10 transition-colors">
                {t.logout}
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
            {/* Mobile header */}
            <header className="md:hidden bg-[#1a5fa8] dark:bg-[#0f3c6e] text-white px-4 py-3 flex items-center justify-between transition-colors">
              <p className="font-bold text-sm cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                {t.appName}
              </p>
              <button onClick={() => setCurrentUser(null)} className="text-white/70 text-xs">{t.logout}</button>
            </header>

            {/* Mobile nav */}
            <nav className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto px-2 py-1 gap-1 transition-colors">
              {[
                { id: 'dashboard', label: t.dashboard, icon: '📊' },
                { id: 'calendar', label: t.calendar, icon: '📅' },
                { id: 'bookings', label: isAdmin ? t.allBookings : t.myBookings, icon: '📋' },
                ...(isAdmin ? [{ id: 'rooms', label: t.rooms, icon: '🚪' }] : []),
                ...(isAdmin ? [{ id: 'users', label: t.users, icon: '👥' }] : []),
                { id: 'settings', label: t.settings, icon: '⚙️' },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === item.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeTab === 'dashboard' && `📊 ${t.dashboard}`}
                    {activeTab === 'calendar' && `📅 ${t.calendar}`}
                    {activeTab === 'bookings' && `📋 ${isAdmin ? t.allBookings : t.myBookings}`}
                    {activeTab === 'rooms' && `🚪 ${t.rooms}`}
                    {activeTab === 'users' && `👥 ${t.users}`}
                    {activeTab === 'settings' && `⚙️ ${t.settings}`}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(TODAY, language)}
                  </p>
                </div>
                {activeTab === 'rooms' ? (
                  <button onClick={() => { setEditingRoom(undefined); setShowRoomModal(true); }}
                    className="flex items-center gap-2 bg-[#0891b2] hover:bg-[#067a96] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                    {t.addRoom}
                  </button>
                ) : activeTab !== 'settings' && activeTab !== 'users' ? (
                  <button onClick={() => setShowBookingModal(true)}
                    className="flex items-center gap-2 bg-[#1a5fa8] hover:bg-[#134a86] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors">
                    {t.bookRoom}
                  </button>
                ) : null}
              </div>

              {/* ── Dashboard ── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat label={t.roomsReady} value={rooms.filter(r => r.status === 'available').length} icon="🚪" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                    <Stat label={t.todayBookings} value={bookings.filter(b => b.date === TODAY && b.status === 'approved').length} icon="✅" color="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" />
                    <Stat label={t.pendingApprovals} value={bookings.filter(b => b.status === 'pending').length} icon="⏳" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" onClick={() => { setActiveTab('bookings'); setFilterStatus('pending'); }} />
                    <Stat label={t.totalBookings} value={isAdmin ? bookings.length : myBookings.length} icon="📋" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <h2 className="font-bold text-slate-800 dark:text-white">{t.todaySchedule}</h2>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(TODAY, language)}</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {bookings.filter(b => b.date === TODAY && b.status !== 'cancelled' && b.status !== 'rejected').length === 0 ? (
                        <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">{t.noMeetingToday}</p>
                      ) : (
                        bookings.filter(b => b.date === TODAY && b.status !== 'cancelled' && b.status !== 'rejected')
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(b => {
                            const room = rooms.find(r => r.id === b.roomId)
                            const user = users.find(u => u.id === b.userId)
                            return (
                              <div key={b.id} className="px-6 py-4 flex items-center gap-4">
                                <div className="text-center w-16 flex-none">
                                  <p className="text-sm font-bold text-slate-800 dark:text-white">{b.startTime}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500">{b.endTime}</p>
                                </div>
                                <div className="w-1 h-10 rounded-full bg-[#1a5fa8] dark:bg-blue-500 flex-none" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-800 dark:text-white truncate">{b.purpose}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{room?.name} · {user?.name} · {b.attendees} {t.people}</p>
                                </div>
                                <Badge status={b.status} />
                              </div>
                            )
                          })
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                      <h2 className="font-bold text-slate-800 dark:text-white">{t.roomStatus}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {rooms.map(room => {
                        const activeBooking = bookings.find(b =>
                          b.roomId === room.id && b.date === TODAY && b.status === 'approved' &&
                          b.startTime <= new Date().toTimeString().slice(0, 5) &&
                          b.endTime > new Date().toTimeString().slice(0, 5)
                        )
                        const isInUse = !!activeBooking
                        const isMaintenance = room.status === 'maintenance'
                        return (
                          <div key={room.id} className={`rounded-xl p-4 border-2 transition-colors ${isMaintenance ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' : isInUse ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-slate-800 dark:text-white text-sm">{room.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isMaintenance ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200' : isInUse ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'}`}>
                                {isMaintenance ? t.maintenance : isInUse ? t.inUse : t.free}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{room.location} · {room.capacity} {t.people}</p>
                            {isInUse && activeBooking && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{activeBooking.startTime}–{activeBooking.endTime} · {activeBooking.purpose}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Calendar ── */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.selectDate}</label>
                      <input type="date" value={calendarDate} onChange={e => setCalendarDate(e.target.value)}
                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{formatDate(calendarDate, language)}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {rooms.filter(r => r.status === 'available').map(room => {
                        const roomBookings = calendarBookings.filter(b => b.roomId === room.id)
                        return (
                          <div key={room.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors">
                            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                              <span className="font-medium text-slate-800 dark:text-white text-sm">{room.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{room.location} · {room.capacity} {t.people}</span>
                            </div>
                            {roomBookings.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">{t.noBookingAllDay}</p>
                            ) : (
                              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {roomBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(b => {
                                  const user = users.find(u => u.id === b.userId)
                                  return (
                                    <div key={b.id} className="px-4 py-3 flex items-center gap-3">
                                      <div className="w-14 text-center flex-none">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.startTime}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{b.endTime}</p>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{b.purpose}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.name} · {b.attendees} {t.people}</p>
                                      </div>
                                      <Badge status={b.status} />
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
                </div>
              )}

              {/* ── Bookings List ── */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-wrap gap-3 transition-colors">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t.statusFilter}</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">{t.all}</option>
                        <option value="pending">{t.pending}</option>
                        <option value="approved">{t.approved}</option>
                        <option value="rejected">{t.rejected}</option>
                        <option value="cancelled">{t.cancelled}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t.dateFilter}</label>
                      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {filterDate && (
                      <div className="self-end">
                        <button onClick={() => setFilterDate('')} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">{t.clearFilter}</button>
                      </div>
                    )}
                    <div className="ml-auto self-end text-sm text-slate-500 dark:text-slate-400">{filteredBookings.length} {t.items}</div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                    {filteredBookings.length === 0 ? (
                      <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">{t.noBookingsFound}</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredBookings.map(b => {
                          const room = rooms.find(r => r.id === b.roomId)
                          const user = users.find(u => u.id === b.userId)
                          const isOwn = b.userId === currentUser?.id
                          return (
                            <div key={b.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="font-semibold text-slate-800 dark:text-white">{b.purpose}</p>
                                    <Badge status={b.status} />
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <span>📅 {formatDate(b.date, language)}</span>
                                    <span>🕐 {b.startTime} – {b.endTime}</span>
                                    <span>🚪 {room?.name}</span>
                                    <span>👥 {b.attendees} {t.people}</span>
                                    {isAdmin && <span>👤 {user?.name} ({user?.department})</span>}
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-none">
                                  {isAdmin && b.status === 'pending' && (
                                    <>
                                      <button onClick={() => handleApprove(b.id)}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-800/50 text-xs font-medium rounded-lg transition-colors">
                                        {t.approve}
                                      </button>
                                      <button onClick={() => handleReject(b.id)}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/50 text-xs font-medium rounded-lg transition-colors">
                                        {t.reject}
                                      </button>
                                    </>
                                  )}
                                  {isOwn && (b.status === 'pending' || b.status === 'approved') && (
                                    <button onClick={() => handleCancel(b.id)}
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 text-xs font-medium rounded-lg transition-colors">
                                      {t.cancel}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Rooms (Admin) ── */}
              {activeTab === 'rooms' && isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rooms.map(room => {
                    const todayCount = bookings.filter(b => b.roomId === room.id && b.date === TODAY && b.status === 'approved').length
                    return (
                      <div key={room.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors">
                        <div className="h-2 bg-gradient-to-r from-[#1a5fa8] to-[#0891b2]" />
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-slate-800 dark:text-white">{room.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{room.location}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                              {room.status === 'available' ? t.available : t.maintenance}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                            <span>👥 {t.capacity} {room.capacity} {t.people}</span>
                            <span>📅 วันนี้ {todayCount} {t.items}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {room.equipment.map(eq => (
                              <span key={eq} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{eq}</span>
                            ))}
                          </div>
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                          <button onClick={() => { setEditingRoom(room); setShowRoomModal(true); }}
                            className="text-sm text-[#1a5fa8] dark:text-blue-400 hover:text-[#134a86] dark:hover:text-blue-300 font-medium transition-colors">
                            {t.edit}
                          </button>
                          <button onClick={() => handleDeleteRoom(room.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Users (Admin) ── */}
              {activeTab === 'users' && isAdmin && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 dark:text-white">{t.userList}</h2>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map(u => (
                      <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${u.role === 'admin' ? 'bg-[#1a5fa8]' : 'bg-[#0891b2]'}`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.username}: {u.username} · {u.role === 'admin' ? t.admin : t.user}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newPassword = window.prompt(`${t.setNewPassword} ${u.name}:`)
                            if (newPassword) {
                              setUsers(prev => prev.map(user => user.id === u.id ? { ...user, password: newPassword } : user))
                              showToast(t.toastPasswordChanged)
                            }
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          {t.changePassword}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Settings ── */}
              {activeTab === 'settings' && (
                <SettingsScreen />
              )}
            </div>
          </main>

          {showBookingModal && currentUser && (
            <BookingModal
              rooms={rooms}
              userId={currentUser.id}
              bookings={bookings}
              onClose={() => setShowBookingModal(false)}
              onSubmit={handleBookingSubmit}
            />
          )}

          {showRoomModal && (
            <RoomModal
              room={editingRoom}
              onClose={() => { setShowRoomModal(false); setEditingRoom(undefined); }}
              onSubmit={handleSaveRoom}
            />
          )}

          {toast && (
            <div className="fixed bottom-24 right-6 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-xl z-50 animate-fade-in">
              ✅ {toast}
            </div>
          )}
        </div>
      )}
    </AppContext.Provider>
  )
}
