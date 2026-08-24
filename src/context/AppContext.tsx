import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"
import { Language, ThemeOption, User, Room, Booking } from "../types"
import { getTranslation, translations } from "../constants/translations"
import * as api from "../services/api"
import { API_URL } from "../services/api"

// ─── Default Fallback Seed Data ────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0]
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split("T")[0]

const DEFAULT_ROOMS: Room[] = [
  {
    id: "r1",
    name: "ห้องประชุมใหญ่ (Grand Hall)",
    capacity: 60,
    location: "อาคาร A ชั้น 2",
    equipment: [
      "โปรเจคเตอร์ 4K",
      "ไมโครโฟนไร้สาย 4 ตัว",
      "จอภาพ LED ขนาดใหญ่",
      "ระบบเสียงห้องประชุม",
      "ระบบบันทึกเสียง",
    ],
    status: "available",
  },
  {
    id: "r2",
    name: "ห้องประชุมวิชาการแพทย์ 1",
    capacity: 25,
    location: "อาคาร A ชั้น 1",
    equipment: [
      "โปรเจคเตอร์ HD",
      "กระดานไวท์บอร์ดอัจฉริยะ",
      "ระบบวิดีโอคอนเฟอเรนซ์",
      "ไมโครโฟนตั้งโต๊ะ",
    ],
    status: "available",
  },
  {
    id: "r3",
    name: "ห้องประชุมกลุ่มงานการพยาบาล",
    capacity: 20,
    location: "อาคาร B ชั้น 3",
    equipment: ["สมาร์ททีวี 75 นิ้ว", "กระดานไวท์บอร์ด", "ระบบ Zoom Meeting"],
    status: "available",
  },
  {
    id: "r4",
    name: "ห้องอบรมสัมมนาบุคลากร (Auditorium)",
    capacity: 100,
    location: "อาคาร C ชั้น 1",
    equipment: [
      "โปรเจคเตอร์ x2",
      "ระบบเสียงรอบทิศทาง",
      "เวทีบรรยาย",
      "ไมโครโฟน 6 ตัว",
      "ระบบถ่ายทอดสด",
    ],
    status: "available",
  },
  {
    id: "r5",
    name: "ห้องประชุมผู้บริหาร VIP",
    capacity: 12,
    location: "อาคาร A ชั้น 3",
    equipment: [
      "จอภาพ 4K",
      "กล้องหมุนตามเสียง",
      "ระบบเสียง Conference",
      "มุมชา/กาแฟรับรอง",
    ],
    status: "maintenance",
  },
]

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "b1",
    roomId: "r1",
    userId: "u2",
    date: TODAY,
    startTime: "09:00",
    endTime: "11:30",
    purpose: "ประชุมคณะกรรมการบริหารและแพทย์ประจำเดือน",
    attendees: 35,
    status: "approved",
    createdAt: TODAY,
  },
  {
    id: "b2",
    roomId: "r2",
    userId: "u3",
    date: TODAY,
    startTime: "13:00",
    endTime: "15:00",
    purpose: "ประชุมพัฒนาคุณภาพมาตรฐาน HA ทีมพยาบาล",
    attendees: 18,
    status: "pending",
    createdAt: TODAY,
  },
  {
    id: "b3",
    roomId: "r3",
    userId: "u4",
    date: TOMORROW,
    startTime: "10:00",
    endTime: "12:00",
    purpose: "อบรมระบบจ่ายยาและความปลอดภัยทางเภสัชกรรม",
    attendees: 16,
    status: "approved",
    createdAt: TODAY,
  },
  {
    id: "b4",
    roomId: "r4",
    userId: "u2",
    date: TOMORROW,
    startTime: "13:30",
    endTime: "16:30",
    purpose: "สัมมนาการดูแลผู้ป่วยฉุกเฉินประจำปี 2569",
    attendees: 75,
    status: "pending",
    createdAt: TODAY,
  },
  {
    id: "b5",
    roomId: "r2",
    userId: "u3",
    date: TODAY,
    startTime: "08:00",
    endTime: "09:00",
    purpose: "Morning Briefing ประจำวันทีมเวชปฏิบัติ",
    attendees: 10,
    status: "approved",
    createdAt: TODAY,
  },
]

const DEFAULT_USERS: User[] = [
  {
    id: "u1",
    name: "นายแพทย์ ผู้ดูแลระบบ",
    department: "ศูนย์คอมพิวเตอร์และสารสนเทศ",
    role: "admin",
    username: "Admin",
  },
  {
    id: "u2",
    name: "พว. สมศรี ใจดี",
    department: "กลุ่มงานการพยาบาล",
    role: "user",
    username: "Test",
  },
  {
    id: "u3",
    name: "ภก. วินัย ชำนาญการ",
    department: "กลุ่มงานเภสัชกรรม",
    role: "user",
    username: "Pharma",
  },
  {
    id: "u4",
    name: "นพ. กิตติพงษ์ สุขสวัสดิ์",
    department: "กลุ่มงานศัลยศาสตร์",
    role: "user",
    username: "Doctor",
  },
]

// ─── Context Interface ────────────────────────────────────────────────────────

interface AppContextType {
  t: typeof translations.th
  language: Language
  setLanguage: (l: Language) => void
  theme: ThemeOption
  setTheme: (t: ThemeOption) => void
  currentUser: User | null
  setCurrentUser: (u: User | null) => void
  rooms: Room[]
  bookings: Booking[]
  users: User[]
  loading: boolean
  toast: string | null
  showToast: (msg: string) => void
  refreshData: () => Promise<void>
  handleBookingSubmit: (b: {
    roomId: string
    date: string
    startTime: string
    endTime: string
    purpose: string
    attendees: number
  }) => Promise<void>
  handleApprove: (id: string) => Promise<void>
  handleReject: (id: string, reason?: string) => Promise<void>
  handleCancel: (id: string) => Promise<void>
  handleSaveRoom: (r: Room) => Promise<void>
  handleDeleteRoom: (id: string) => Promise<void>
  handleSaveUser: (
    u: Partial<User> & { username: string name: string },
  ) => Promise<void>
  handleDeleteUser: (id: string) => Promise<void>
  handleClearAllBookings: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return localStorage.getItem("language") as Language || "th"
  })

  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem("theme")
    return saved === "dark" ? "dark" : "light"
  })

  const [currentUser, setCurrentUserState] = useState<User | null>(() =>
    api.getSavedUser(),
  )
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS)
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS)
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const t = useMemo(() => getTranslation(language), [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const setTheme = (thm: ThemeOption) => {
    setThemeState(thm)
    localStorage.setItem("theme", thm)
  }

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user)
    if (!user) {
      api.logout()
    }
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev))
    }, 3500)
  }, [])

  // Sync theme class to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  // Data Fetcher
  const refreshData = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [b, r, u] = await Promise.allSettled([
        api.fetchBookings(),
        api.fetchRooms(),
        currentUser.role === "admin" ? api.fetchUsers() : Promise.resolve([]),
      ])

      if (b.status === "fulfilled" && Array.isArray(b.value)) {
        setBookings(b.value)
      }
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        setRooms(r.value)
      }
      if (
        u.status === "fulfilled" &&
        Array.isArray(u.value) &&
        u.value.length > 0
      ) {
        setUsers(u.value)
      }
    } catch (err) {
      console.warn("API fetch warning, using existing cache:", err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // Real-time EventSource & Polling
  useEffect(() => {
    if (!currentUser) return
    refreshData()

    let es: EventSource | null = null
    try {
      es = new EventSource(`${API_URL}/api/stream`)
      es.onmessage = (e) => {
        if (e.data === "update") refreshData()
      }
    } catch {
      // Ignore SSE failure if backend is offline
    }

    const poll = setInterval(() => {
      refreshData()
    }, 15000)

    return () => {
      if (es) es.close()
      clearInterval(poll)
    }
  }, [currentUser, refreshData])

  // Actions
  const handleBookingSubmit = async (data: {
    roomId: string
    date: string
    startTime: string
    endTime: string
    purpose: string
    attendees: number
  }) => {
    try {
      const created = await api.createBooking(data)
      setBookings((prev) => [created, ...prev])
      showToast(t.toastBookingSuccess)
    } catch (err: any) {
      // Fallback local mock if backend request failed
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError")
      ) {
        const newB: Booking = {
          id: "b" + Date.now(),
          roomId: data.roomId,
          userId: currentUser?.id || "u2",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          purpose: data.purpose,
          attendees: data.attendees,
          status: "pending",
          createdAt: TODAY,
        }
        setBookings((prev) => [newB, ...prev])
        showToast(t.toastBookingSuccess)
        return
      }
      throw err
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await api.updateBookingStatus(id, "approved")
    } catch {
      // Offline fallback
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "approved" } : b)),
    )
    showToast(t.toastApproveSuccess)
  }

  const handleReject = async (id: string, reason?: string) => {
    try {
      await api.updateBookingStatus(id, "rejected", reason)
    } catch {
      // Offline fallback
    }
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "rejected", rejectReason: reason || null }
          : b,
      ),
    )
    showToast(t.toastRejectSuccess)
  }

  const handleCancel = async (id: string) => {
    try {
      await api.updateBookingStatus(id, "cancelled")
    } catch {
      // Offline fallback
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    )
    showToast(t.toastCancelSuccess)
  }

  const handleSaveRoom = async (room: Room) => {
    const isEdit = rooms.some((r) => r.id === room.id)
    try {
      if (isEdit) {
        await api.editRoom(room.id, room)
      } else {
        await api.addRoom(room)
      }
    } catch {
      // Offline fallback
    }

    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === room.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = room
        return next
      }
      return [...prev, room]
    })
    showToast(isEdit ? t.toastRoomEdited : t.toastRoomAdded)
  }

  const handleDeleteRoom = async (id: string) => {
    try {
      await api.deleteRoom(id)
    } catch {
      // Offline fallback
    }
    setRooms((prev) => prev.filter((r) => r.id !== id))
    setBookings((prev) => prev.filter((b) => b.roomId !== id))
    showToast(t.toastRoomDeleted)
  }

  const handleSaveUser = async (
    userData: Partial<User> & { username: string name: string },
  ) => {
    const isEdit = !!userData.id
    try {
      if (isEdit) {
        const updated = await api.updateUser(userData.id!, userData as any)
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
        )
      } else {
        const created = await api.createUser(userData as any)
        setUsers((prev) => [...prev, created])
      }
    } catch {
      // Offline fallback
      if (isEdit) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userData.id ? { ...u, ...userData } as User : u,
          ),
        )
      } else {
        const newU: User = {
          id: "u" + Date.now(),
          name: userData.name,
          department: userData.department || "-",
          role: userData.role || "user",
          username: userData.username,
        }
        setUsers((prev) => [...prev, newU])
      }
    }
    showToast(isEdit ? t.toastUserEdited : t.toastUserAdded)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id)
    } catch {
      // Offline fallback
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    showToast(t.toastUserDeleted)
  }

  const handleClearAllBookings = async () => {
    try {
      await api.deleteAllBookings()
    } catch {
      // Offline fallback
    }
    setBookings([])
    showToast(t.toastAllBookingsDeleted)
  }

  const value = {
    t,
    language,
    setLanguage,
    theme,
    setTheme,
    currentUser,
    setCurrentUser,
    rooms,
    bookings,
    users,
    loading,
    toast,
    showToast,
    refreshData,
    handleBookingSubmit,
    handleApprove,
    handleReject,
    handleCancel,
    handleSaveRoom,
    handleDeleteRoom,
    handleSaveUser,
    handleDeleteUser,
    handleClearAllBookings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
