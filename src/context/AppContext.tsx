import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react"
import { Language, ThemeOption, User, Room, Booking, BookingAttachmentUpload } from "../types"
import { getTranslation, translations, toLocalDateStr } from "../constants/translations"
import * as api from "../services/api"
import { API_URL, setUnauthorizedHandler } from "../services/api"

// ─── Default Fallback Seed Data ────────────────────────────────────────────────

const TODAY = toLocalDateStr(new Date())
const TOMORROW = toLocalDateStr(new Date(Date.now() + 86400000))

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
    relatedLinks?: { title: string; url: string }[]
    attachments?: BookingAttachmentUpload[]
  }) => Promise<void>
  handleApprove: (id: string) => Promise<void>
  handleReject: (id: string, reason?: string) => Promise<void>
  handleCancel: (id: string) => Promise<void>
  handleDeleteBooking: (id: string) => Promise<void>
  handleUpdateBooking: (
    id: string,
    data: Partial<Booking> & {
      newAttachments?: BookingAttachmentUpload[]
      removeAttachmentIds?: string[]
    },
  ) => Promise<void>
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

  // Security cleanup: ล้างข้อมูล offline login เดิม (เคยเก็บรหัสผ่านแบบ plaintext ไว้ใน localStorage)
  useEffect(() => {
    localStorage.removeItem("registered_users")
    if (localStorage.getItem("token") === "offline-mock") {
      setCurrentUserState(null)
      api.logout()
    }
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

  const isPendingDept = (dept?: string | null) =>
    !dept || dept.trim() === "" || dept === "รอการตรวจสอบ" || dept === "-"

  // Refs for stable access inside SSE / polling closures without tearing down connections
  const currentUserRef = useRef(currentUser)
  const languageRef = useRef(language)
  const showToastRef = useRef(showToast)
  const approvalNotifiedUserRef = useRef<string | null>(null)
  const sseConnectedRef = useRef(false)

  useEffect(() => {
    currentUserRef.current = currentUser
    // Reset approval-notified marker when logging out or switching accounts
    if (!currentUser) {
      approvalNotifiedUserRef.current = null
    }
  }, [currentUser])
  useEffect(() => { languageRef.current = language }, [language])
  useEffect(() => { showToastRef.current = showToast }, [showToast])

  const triggerApprovalCelebration = useCallback((userId: string) => {
    if (approvalNotifiedUserRef.current === userId) return
    approvalNotifiedUserRef.current = userId
    setApprovalVisible(true)
    showToastRef.current(
      languageRef.current === "th"
        ? "🎉 บัญชีของคุณได้รับการอนุมัติแล้ว! สามารถจองห้องประชุมได้เลย"
        : "🎉 Your account has been approved! You can now book meeting rooms.",
    )
  }, [])

  // Authenticated data fetcher — full data for logged-in users
  const refreshData = useCallback(async () => {
    const activeUser = currentUserRef.current
    if (!activeUser) return
    setLoading(true)
    try {
      const [b, r, u, me] = await Promise.allSettled([
        api.fetchBookings(),
        api.fetchRooms(),
        activeUser.role === "admin" ? api.fetchUsers() : Promise.resolve([]),
        api.fetchCurrentUser(),
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
      if (me.status === "fulfilled" && me.value && me.value.id) {
        let justApprovedId: string | null = null
        setCurrentUserState((prev) => {
          if (!prev) return prev
          const fresh = me.value
          if (
            prev.role !== "admin" &&
            isPendingDept(prev.department) &&
            !isPendingDept(fresh.department)
          ) {
            justApprovedId = fresh.id
          }
          const changed =
            prev.department !== fresh.department ||
            prev.role !== fresh.role ||
            prev.name !== fresh.name ||
            prev.email !== fresh.email ||
            prev.username !== fresh.username ||
            Boolean(prev.emailVerified) !== Boolean(fresh.emailVerified) ||
            prev.member_id !== fresh.member_id ||
            (prev.position || "") !== (fresh.position || "") ||
            (prev.gender || "") !== (fresh.gender || "") ||
            (prev.phone || "") !== (fresh.phone || "") ||
            (prev.avatarUrl || "") !== (fresh.avatarUrl || "")
          if (!changed) return prev
          const merged = { ...prev, ...fresh }
          localStorage.setItem("user", JSON.stringify(merged))
          return merged
        })
        if (justApprovedId) {
          triggerApprovalCelebration(justApprovedId)
        }
      }
    } catch (err) {
      console.warn("API fetch warning, using existing cache:", err)
    } finally {
      setLoading(false)
    }
  }, [triggerApprovalCelebration])

  // Always poll public data (even when not logged in)
  useEffect(() => {
    refreshPublicData()
    const poll = setInterval(refreshPublicData, 15000)
    return () => clearInterval(poll)
  }, [refreshPublicData])

  const currentUserId = currentUser?.id
  const currentUserRole = currentUser?.role
  const isCurrentUserPending = Boolean(
    currentUser &&
      currentUser.role !== "admin" &&
      isPendingDept(currentUser.department),
  )

  // Real-time Fetch-based SSE (supports ngrok-skip-browser-warning header unlike native EventSource!)
  useEffect(() => {
    if (!currentUserId) return
    refreshData()

    let cancelled = false
    let abortController: AbortController | null = null
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let retryDelay = 2000

    const handleSsePayload = (payload: string) => {
      if (payload === "update") {
        refreshData()
        setHasPendingUpdate(true)
      } else if (payload === "user_approved") {
        triggerApprovalCelebration(currentUserId)
        refreshData()
      } else if (payload === "booking_auto_rejected") {
        showToastRef.current(
          languageRef.current === "th"
            ? "⚠️ คำขอจองของคุณถูกยกเลิกอัตโนมัติ เนื่องจากผู้ดูแลระบบได้อนุมัติการจองในช่วงเวลาดังกล่าวให้ผู้จองท่านอื่นแล้ว"
            : "⚠️ Your booking request was automatically rejected because an admin approved another overlapping booking.",
        )
        refreshData()
      }
    }

    const scheduleReconnect = () => {
      sseConnectedRef.current = false
      if (cancelled) return
      retryTimeout = setTimeout(() => {
        retryDelay = Math.min(retryDelay * 2, 20000)
        connect()
      }, retryDelay)
    }

    const connect = async () => {
      if (cancelled) return
      abortController = new AbortController()
      try {
        const streamUrl = `${API_URL}/api/stream?userId=${encodeURIComponent(currentUserId)}`
        const res = await fetch(streamUrl, {
          headers: {
            Accept: "text/event-stream",
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
          signal: abortController.signal,
        })

        const contentType = res.headers.get("content-type") || ""
        if (!res.ok || !res.body || !contentType.includes("text/event-stream")) {
          scheduleReconnect()
          return
        }

        sseConnectedRef.current = true
        retryDelay = 2000

        const reader = res.body.getReader()
        const decoder = new TextDecoder("utf-8")
        let buffer = ""

        while (!cancelled) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ""
          for (const rawLine of lines) {
            const line = rawLine.trim()
            if (line.startsWith("data:")) {
              const payload = line.slice(5).trim()
              if (payload && payload !== "connected") {
                handleSsePayload(payload)
              }
            }
          }
        }
        scheduleReconnect()
      } catch {
        scheduleReconnect()
      }
    }

    connect()

    // Instant sync when user returns to this browser tab / unlocks phone
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        refreshData()
      }
    }
    window.addEventListener("focus", handleVisibilityOrFocus)
    document.addEventListener("visibilitychange", handleVisibilityOrFocus)

    return () => {
      cancelled = true
      sseConnectedRef.current = false
      if (abortController) abortController.abort()
      if (retryTimeout) clearTimeout(retryTimeout)
      window.removeEventListener("focus", handleVisibilityOrFocus)
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus)
    }
  }, [currentUserId, refreshData, triggerApprovalCelebration])

  // Lightweight fallback polling:
  // - Pending users: check every 8s while tab is visible so approval unlocks immediately even if SSE dropped
  // - Admins: check every 15s while tab is visible if SSE is disconnected so new signups appear automatically
  useEffect(() => {
    if (!currentUserId) return
    if (!isCurrentUserPending && currentUserRole !== "admin") return

    const intervalMs = isCurrentUserPending ? 8000 : 15000
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return
      if (isCurrentUserPending || !sseConnectedRef.current) {
        refreshData()
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [currentUserId, currentUserRole, isCurrentUserPending, refreshData])

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
    relatedLinks?: { title: string; url: string }[]
    attachments?: BookingAttachmentUpload[]
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
          relatedLinks: data.relatedLinks || [],
          attachments: (data.attachments || []).map((a, idx) => ({
            id: `local_${Date.now()}_${idx}`,
            name: a.name,
            mimeType: a.mimeType,
            size: a.size,
            data: a.data,
          })),
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
      const res = await api.updateBookingStatus(id, "approved")
      // Refresh จาก backend เพื่อให้เห็น auto-reject ของรายการที่ซ้อนทับ
      await refreshData()
      if (res.autoRejectedCount && res.autoRejectedCount > 0) {
        showToast(
          language === "th"
            ? `อนุมัติการจองเรียบร้อยแล้ว (ระบบยกเลิกคำขอที่ซ้อนทับอัตโนมัติ ${res.autoRejectedCount} รายการ)`
            : `Booking approved (${res.autoRejectedCount} overlapping request(s) auto-rejected)`,
        )
      } else {
        showToast(t.toastApproveSuccess)
      }
    } catch (err: any) {
      const isNetworkOffline =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      if (!isNetworkOffline) {
        showToast(
          err?.message ||
            (language === "th"
              ? "ไม่สามารถอนุมัติการจองนี้ได้"
              : "Failed to approve booking"),
        )
        await refreshData()
        return
      }
      // Offline fallback — optimistic update + local auto-reject of overlapping pending bookings
      const autoReason =
        "ระบบยกเลิกอัตโนมัติ เนื่องจากผู้ดูแลระบบได้อนุมัติการจองในช่วงเวลาดังกล่าวให้ผู้จองท่านอื่นแล้ว"
      setBookings((prev) => {
        const target = prev.find((b) => b.id === id)
        if (!target) return prev
        const toMin = (tm: string) => {
          const [h, m] = (tm || "00:00").slice(0, 5).split(":").map(Number)
          return h * 60 + m
        }
        const tS = toMin(target.startTime)
        const tE = toMin(target.endTime)
        return prev.map((b) => {
          if (b.id === id) return { ...b, status: "approved", rejectReason: null }
          if (
            b.status === "pending" &&
            b.roomId === target.roomId &&
            b.date === target.date &&
            toMin(b.startTime) < tE &&
            toMin(b.endTime) > tS
          ) {
            return { ...b, status: "rejected", rejectReason: autoReason }
          }
          return b
        })
      })
      showToast(t.toastApproveSuccess)
    }
  }

  const handleReject = async (id: string, reason?: string) => {
    try {
      await api.updateBookingStatus(id, "rejected", reason)
      // Refresh เพื่อ sync สถานะล่าสุดจาก backend
      await refreshData()
      showToast(t.toastRejectSuccess)
    } catch (err: any) {
      const isNetworkOffline =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      if (!isNetworkOffline) {
        showToast(
          err?.message ||
            (language === "th"
              ? "ไม่สามารถปฏิเสธการจองนี้ได้"
              : "Failed to reject booking"),
        )
        await refreshData()
        return
      }
      // Offline fallback — optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: "rejected", rejectReason: reason || null }
            : b,
        ),
      )
      showToast(t.toastRejectSuccess)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await api.updateBookingStatus(id, "cancelled")
    } catch (err: any) {
      const isNetworkOffline =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      if (!isNetworkOffline) {
        showToast(
          err?.message ||
            (language === "th"
              ? "ไม่สามารถยกเลิกการจองนี้ได้"
              : "Cannot cancel this booking"),
        )
        return
      }
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

  const handleUpdateBooking = async (
    id: string,
    data: Partial<Booking> & {
      newAttachments?: BookingAttachmentUpload[]
      removeAttachmentIds?: string[]
    },
  ) => {
    let updatedAttachments: Booking["attachments"] | undefined
    try {
      const res = await api.updateBookingDetails(id, data)
      updatedAttachments = res.attachments
    } catch (err: any) {
      if (
        !err?.message?.includes("Failed to fetch") &&
        !err?.message?.includes("NetworkError")
      ) {
        showToast(err?.message || (language === "th" ? "บันทึกข้อมูลไม่สำเร็จ" : "Failed to save"))
        throw err
      }
    }
    const { newAttachments, removeAttachmentIds, ...bookingPatch } = data
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const nextAttachments =
          updatedAttachments !== undefined
            ? updatedAttachments
            : [
                ...(b.attachments || []).filter(
                  (a) => !(removeAttachmentIds || []).includes(a.id),
                ),
                ...(newAttachments || []).map((a, idx) => ({
                  id: `local_${Date.now()}_${idx}`,
                  name: a.name,
                  mimeType: a.mimeType,
                  size: a.size,
                  data: a.data,
                })),
              ]
        return { ...b, ...bookingPatch, attachments: nextAttachments }
      }),
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
        if (currentUser?.id === updated.id) {
          setCurrentUserState((prev) => {
            if (!prev) return prev
            const merged = { ...prev, ...updated }
            localStorage.setItem("user", JSON.stringify(merged))
            return merged
          })
        }
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
          username: userData.username || userData.email.split("@")[0],
          email: userData.email,
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
    setBookings((prev) => prev.filter((b) => b.userId !== id))
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
      // No offline fallback — the account only exists if the backend created it.
      // Rethrow so RegisterView can show the real error.
      throw err
    }
  }

  const handleUpdateProfile = async (
    userData: Partial<User> & { id: string },
  ) => {
    let savedUser: Partial<User> = userData
    try {
      const serverUser = await api.updateUser(userData.id, userData as any)
      savedUser = { ...userData, ...serverUser }
    } catch (err: any) {
      const isNetworkOffline =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      if (!isNetworkOffline) {
        // Real backend validation/conflict error (e.g. duplicate email) — do NOT fake success
        throw err
      }
    }

    setCurrentUserState((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...savedUser }
      localStorage.setItem("user", JSON.stringify(updated))
      return updated
    })

    setUsers((prev) =>
      prev.map((u) => (u.id === userData.id ? ({ ...u, ...savedUser } as User) : u)),
    )

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
