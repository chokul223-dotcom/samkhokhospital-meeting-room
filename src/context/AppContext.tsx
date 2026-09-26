import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react"
import { Language, ThemeOption, User, Room, Booking } from "../types"
import { getTranslation, translations } from "../constants/translations"
import * as api from "../services/api"
import { API_URL, setUnauthorizedHandler } from "../services/api"

// ─── Default Fallback Seed Data ────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0]
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split("T")[0]

const DEFAULT_ROOMS: Room[] = [
  {
    id: "r1",
    name: "ห้องประชุมเล็ก 1",
    capacity: 15,
    location: "อาคาร A ชั้น 1",
    equipment: ["โปรเจคเตอร์", "กระดานไวท์บอร์ด"],
    status: "available",
  },
  {
    id: "r2",
    name: "ห้องประชุมใหญ่",
    capacity: 50,
    location: "อาคาร A ชั้น 2",
    equipment: ["โปรเจคเตอร์", "ไมโครโฟน", "จอภาพ", "ระบบเสียง"],
    status: "available",
  },
]

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "b1",
    roomId: "r2",
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
    roomId: "r1",
    userId: "u3",
    date: TODAY,
    startTime: "13:00",
    endTime: "15:00",
    purpose: "ประชุมพัฒนาคุณภาพมาตรฐาน HA ทีมพยาบาล",
    attendees: 12,
    status: "pending",
    createdAt: TODAY,
  },
  {
    id: "b3",
    roomId: "r1",
    userId: "u4",
    date: TOMORROW,
    startTime: "10:00",
    endTime: "12:00",
    purpose: "อบรมระบบจ่ายยาและความปลอดภัยทางเภสัชกรรม",
    attendees: 10,
    status: "approved",
    createdAt: TODAY,
  },
  {
    id: "b4",
    roomId: "r2",
    userId: "u2",
    date: TOMORROW,
    startTime: "13:30",
    endTime: "16:30",
    purpose: "สัมมนาการดูแลผู้ป่วยฉุกเฉินประจำปี 2569",
    attendees: 45,
    status: "pending",
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
  hasPendingUpdate: boolean
  dismissUpdate: () => Promise<void>
  approvalVisible: boolean
  dismissApproval: () => void
  handleBookingSubmit: (b: {
    roomId: string
    date: string
    startTime: string
    endTime: string
    purpose: string
    attendees: number
    chairman?: string
    onlineMeeting?: string
    contactPerson?: string
  }) => Promise<void>
  handleApprove: (id: string) => Promise<void>
  handleReject: (id: string, reason?: string) => Promise<void>
  handleCancel: (id: string) => Promise<void>
  handleDeleteBooking: (id: string) => Promise<void>
  handleUpdateBooking: (id: string, data: Partial<Booking>) => Promise<void>
  handleSaveRoom: (r: Room) => Promise<void>
  handleDeleteRoom: (id: string) => Promise<void>
  handleSaveUser: (
    u: Partial<User> & { email: string; name: string },
  ) => Promise<void>
  handleDeleteUser: (id: string) => Promise<void>
  handleRegisterUser: (u: { email: string; username?: string; name: string; password?: string }) => Promise<void>
  handleUpdateProfile: (u: Partial<User> & { id: string }) => Promise<void>
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
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  // Set users in useEffect after fetch, not from local storage mock mix

  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false)
  const [approvalVisible, setApprovalVisible] = useState(false)

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

  // ลงทะเบียน handler สำหรับ 401 unauthorized — logout ผ่าน React state
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCurrentUserState(null)
    })
  }, [])

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

  // Sync HTML lang attribute → controls native browser date/time picker language
  useEffect(() => {
    document.documentElement.lang = language === "th" ? "th" : "en"
  }, [language])

  // Public data fetcher — runs even when not logged in
  const refreshPublicData = useCallback(async () => {
    if (currentUser) return // Logged in users get full data via refreshData, no need to merge public data
    try {
      const [r, b] = await Promise.allSettled([
        api.fetchPublicRooms(),
        api.fetchPublicBookings(),
      ])
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        setRooms(r.value)
      }
      if (b.status === "fulfilled" && Array.isArray(b.value)) {
        setBookings(b.value)
      }
    } catch (err) {
      console.warn("Public data fetch warning:", err)
    }
  }, [currentUser])

  // Authenticated data fetcher — full data for logged-in users
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
      if (u.status === "fulfilled" && Array.isArray(u.value)) {
        setUsers(u.value)
      }
    } catch (err) {
      console.warn("API fetch warning, using existing cache:", err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // Always poll public data (even when not logged in)
  useEffect(() => {
    refreshPublicData()
    const poll = setInterval(refreshPublicData, 15000)
    return () => clearInterval(poll)
  }, [refreshPublicData])

  // Refs to always access latest values inside SSE closure without re-connecting
  const languageRef = useRef(language)
  const showToastRef = useRef(showToast)
  useEffect(() => { languageRef.current = language }, [language])
  useEffect(() => { showToastRef.current = showToast }, [showToast])

  // Real-time EventSource — ทำงานเฉพาะเมื่อมีเหตุการณ์จาก backend เท่านั้น
  useEffect(() => {
    if (!currentUser) return
    // Initial load — fetch data immediately
    refreshData()

    let es: EventSource | null = null
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let retryDelay = 2000 // เริ่มต้น 2 วินาที

    const connect = () => {
      try {
        // ส่ง userId ไปด้วยเพื่อ subscribe user-specific channel
        const streamUrl = `${API_URL}/api/stream?userId=${encodeURIComponent(currentUser.id)}`
        es = new EventSource(streamUrl)

        es.onopen = () => {
          retryDelay = 2000 // reset delay เมื่อเชื่อมต่อสำเร็จ
        }

        es.onmessage = (e) => {
          if (e.data === "update") {
            // โหลดข้อมูลใหม่ทันทีแบบ background
            refreshData()
            // แสดง banner ว่ามีข้อมูลใหม่ (ถ้าต้องการให้เห็นชัดเจน)
            setHasPendingUpdate(true)
          } else if (e.data === "user_approved") {
            // แจ้งเตือนผู้ใช้ทันทีเมื่อแอดมินอนุมัติบัญชี — real-time via SSE
            setApprovalVisible(true)
            showToastRef.current(
              languageRef.current === "th"
                ? "🎉 บัญชีของคุณได้รับการอนุมัติแล้ว! คุณสามารถใช้งานระบบได้เต็มรูปแบบ"
                : "🎉 Your account has been approved! You can now use the full system."
            )
            // Refresh ข้อมูลเพื่ออัปเดต department และสถานะล่าสุด
            refreshData()
          }
        }

        es.onerror = () => {
          if (es) { es.close(); es = null }
          // Auto-reconnect ด้วย exponential backoff (สูงสุด 30 วินาที)
          retryTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30000)
            connect()
          }, retryDelay)
        }
      } catch {
        // Ignore SSE failure if backend is offline
      }
    }

    connect()

    return () => {
      if (es) es.close()
      if (retryTimeout) clearTimeout(retryTimeout)
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
    chairman?: string
    onlineMeeting?: string
    contactPerson?: string
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
          chairman: data.chairman,
          onlineMeeting: data.onlineMeeting,
          contactPerson: data.contactPerson,
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
      // Refresh จาก backend เพื่อให้เห็น auto-reject ของรายการที่ซ้อนทับ
      await refreshData()
    } catch {
      // Offline fallback — optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "approved" } : b)),
      )
    }
    showToast(t.toastApproveSuccess)
  }

  const handleReject = async (id: string, reason?: string) => {
    try {
      await api.updateBookingStatus(id, "rejected", reason)
      // Refresh เพื่อ sync สถานะล่าสุดจาก backend
      await refreshData()
    } catch {
      // Offline fallback — optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: "rejected", rejectReason: reason || null }
            : b,
        ),
      )
    }
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

  const handleDeleteBooking = async (id: string) => {
    try {
      await api.deleteBooking(id)
    } catch {
      // Offline fallback
    }
    setBookings((prev) => prev.filter((b) => b.id !== id))
    showToast(language === 'th' ? 'ลบการจองเรียบร้อยแล้ว' : 'Booking deleted')
  }

  const handleUpdateBooking = async (id: string, data: Partial<Booking>) => {
    try {
      await api.updateBookingDetails(id, data)
    } catch {
      // Offline fallback
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
    )
    showToast(language === "th" ? "บันทึกข้อมูลการจองเรียบร้อย" : "Booking updated successfully")
  }

  const handleSaveRoom = async (room: Room) => {
    const isEdit = rooms.some((r) => r.id === room.id)
    try {
      if (isEdit) {
        await api.editRoom(room.id, room)
      } else {
        await api.addRoom(room)
      }
      // Refresh both authenticated and public data to ensure state is completely synced
      await Promise.allSettled([refreshData(), refreshPublicData()])
      showToast(isEdit ? t.toastRoomEdited : t.toastRoomAdded)
    } catch (err: any) {
      console.error("Save room error:", err)
      showToast(err.message || (language === "th" ? "บันทึกห้องประชุมไม่สำเร็จ" : "Failed to save room"))
      throw err
    }
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
    userData: Partial<User> & { email: string; name: string },
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
        try {
          const stored = localStorage.getItem("registered_users")
          if (stored) {
            let parsed = JSON.parse(stored)
            parsed = parsed.map((u: any) => u.id === userData.id ? { ...u, ...userData } : u)
            localStorage.setItem("registered_users", JSON.stringify(parsed))
          }
        } catch { }
      } else {
        const newU: User = {
          id: "u" + Date.now(),
          name: userData.name,
          department: userData.department || "-",
          role: userData.role || "user",
          username: userData.username || userData.email.split("@")[0],
          email: userData.email,
        }
        setUsers((prev) => [...prev, newU])
        try {
          const stored = localStorage.getItem("registered_users")
          const parsed = stored ? JSON.parse(stored) : []
          parsed.push({ ...newU })
          localStorage.setItem("registered_users", JSON.stringify(parsed))
        } catch { }
      }
    }
    showToast(isEdit ? t.toastUserEdited : t.toastUserAdded)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id)
    } catch {
      // Offline fallback
      try {
        const stored = localStorage.getItem("registered_users")
        if (stored) {
          let parsed = JSON.parse(stored)
          parsed = parsed.filter((u: any) => u.id !== id)
          localStorage.setItem("registered_users", JSON.stringify(parsed))
        }
      } catch { }
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    showToast(t.toastUserDeleted)
  }

  const handleRegisterUser = async (u: { email: string; username?: string; name: string; password?: string }) => {
    try {
      const created = await api.register?.({ email: u.email, username: u.username, password: u.password || "", name: u.name })
      if (created?.user) {
        // Successfully registered in backend — add to users list so admin sees immediately
        setUsers((prev) => {
          if (prev.find((x) => x.email === u.email || (x.username && x.username === u.username))) return prev
          return [...prev, { ...created.user, department: created.user.department || "รอการตรวจสอบ" } as any]
        })
      }
    } catch (err: any) {
      // If duplicate, rethrow so LoginView can show error
      if (err.message?.includes("already exists")) throw err
      // Offline fallback — do NOT push here; LoginView already wrote to registered_users
      // and AppContext init will pick it up on next load. Just keep state in sync.
      setUsers((prev) => {
        if (prev.find((x) => x.email === u.email || (x.username && x.username === u.username))) return prev
        const newU: User = {
          id: "u" + Date.now(),
          name: u.name,
          department: "รอการตรวจสอบ",
          role: "user",
          username: u.username || u.email.split("@")[0],
          email: u.email,
        }
        // Also update the localStorage entry to use the same id
        try {
          const stored = localStorage.getItem("registered_users")
          if (stored) {
            const parsed: any[] = JSON.parse(stored)
            const idx = parsed.findIndex((x) => x.email === u.email || (x.username && x.username === u.username))
            if (idx >= 0) {
              parsed[idx].id = newU.id
              localStorage.setItem("registered_users", JSON.stringify(parsed))
            }
          }
        } catch { }
        return [...prev, newU]
      })
    }
  }

  const handleUpdateProfile = async (
    userData: Partial<User> & { id: string },
  ) => {
    setCurrentUserState((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...userData }
      localStorage.setItem("user", JSON.stringify(updated))
      return updated
    })

    setUsers((prev) =>
      prev.map((u) => (u.id === userData.id ? ({ ...u, ...userData } as User) : u)),
    )

    try {
      await api.updateUser(userData.id, userData as any)
    } catch {
      // Offline fallback
    }

    try {
      const stored = localStorage.getItem("registered_users")
      if (stored) {
        let parsed = JSON.parse(stored)
        parsed = parsed.map((u: any) =>
          u.id === userData.id ? { ...u, ...userData } : u,
        )
        localStorage.setItem("registered_users", JSON.stringify(parsed))
      }
    } catch { }

    showToast(language === "th" ? "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว" : "Profile updated successfully")
  }

  const handleClearAllBookings = async () => {
    try {
      await api.deleteAllBookings()
      // Clear ข้อมูลเฉพาะเมื่อ API สำเร็จเท่านั้น
      setBookings([])
      await refreshData()
      showToast(t.toastAllBookingsDeleted)
    } catch {
      // ถ้า API ล้มเหลว แสดง error แทน (ไม่ clear state ปลอม)
      showToast(language === "th" ? "ล้างประวัติไม่สำเร็จ กรุณาลองใหม่" : "Failed to clear bookings, please try again")
    }
  }

  const dismissUpdate = useCallback(async () => {
    await refreshData()
    setHasPendingUpdate(false)
  }, [refreshData])

  const dismissApproval = useCallback(() => {
    setApprovalVisible(false)
  }, [])

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
    hasPendingUpdate,
    dismissUpdate,
    approvalVisible,
    dismissApproval,
    handleBookingSubmit,
    handleApprove,
    handleReject,
    handleCancel,
    handleDeleteBooking,
    handleUpdateBooking,
    handleSaveRoom,
    handleDeleteRoom,
    handleSaveUser,
    handleDeleteUser,
    handleRegisterUser,
    handleUpdateProfile,
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
