import React, { useState, useEffect } from "react"
import {
  LogIn,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Phone,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  FileText,
  Mail,
} from "lucide-react"
import { PrivacyPolicyModal } from "../components/modals/PrivacyPolicyModal"
import { useApp } from "../context/AppContext"
import { LanguageSwitcher } from "../components/common/LanguageSwitcher"
import { ThemeToggle } from "../components/common/ThemeToggle"
import { VideoWidget } from "../components/common/VideoWidget"
import { DoctorWaiAvatar } from "../components/common/DoctorWaiAvatar"
import * as api from "../services/api"

interface LoginViewProps {
  onBackToHome?: () => void
}


// ─── Main LoginView ────────────────────────────────────────────────────────────
export const LoginView: React.FC<LoginViewProps> = ({ onBackToHome }) => {
  const { t, setCurrentUser, handleRegisterUser, users } = useApp()

  // ── Login state ──
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Register state ──
  const [mode, setMode] = useState<"login" | "register">("login")
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")
  const [regFullName, setRegFullName] = useState("")
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [regError, setRegError] = useState("")
  const [regSuccess, setRegSuccess] = useState("")
  const [regLoading, setRegLoading] = useState(false)

  // ── Privacy Policy Modal ──
  const [showPrivacy, setShowPrivacy] = useState(false)

  // ── Slideshow ──
  const [bgIndex, setBgIndex] = useState(0)
  const backgrounds = [
    { src: "/backgrounds/Picture 1.jpg", style: { backgroundImage: "url('/backgrounds/Picture 1.jpg')", backgroundPosition: "center center", backgroundSize: "cover", backgroundColor: "#d6aa49" } },
    { src: "/backgrounds/Picture 2.jpg", style: { backgroundImage: "url('/backgrounds/Picture 2.jpg')", backgroundPosition: "center top", backgroundSize: "cover", backgroundColor: "#a98a75" } },
    { src: "/backgrounds/Picture 3.png", style: { backgroundImage: "url('/backgrounds/Picture 3.png')", backgroundPosition: "center center", backgroundSize: "contain", backgroundColor: "#124b48" } },
    { src: "/backgrounds/Picture 4.jpg", style: { backgroundImage: "url('/backgrounds/Picture 4.jpg')", backgroundPosition: "center center", backgroundSize: "cover" } },
    { src: "/backgrounds/Picture 5.jpg", style: { backgroundImage: "url('/backgrounds/Picture 5.jpg')", backgroundPosition: "center center", backgroundSize: "cover" } },
    { src: "/backgrounds/Picture 6.jpg", style: { backgroundImage: "url('/backgrounds/Picture 6.jpg')", backgroundPosition: "center center", backgroundSize: "cover" } },
    { src: "/backgrounds/Picture 7.jpg", style: { backgroundImage: "url('/backgrounds/Picture 7.jpg')", backgroundPosition: "center center", backgroundSize: "cover" } },
    { src: "/backgrounds/Picture 8.jpg", style: { backgroundImage: "url('/backgrounds/Picture 8.jpg')", backgroundPosition: "center center", backgroundSize: "cover" } },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [backgrounds.length])

  // ── Login Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.login(username, password)
      setCurrentUser(res.user as any)
    } catch {
      // Check hardcoded mock admins first
      if (
        (username === "admin@example.com" && password === "Admin123456") ||
        (username === "test@example.com" && password === "Test123456")
      ) {
        const isAdmin = username === "admin@example.com"
        const mockUser = {
          id: isAdmin ? "u1" : "u2",
          name: isAdmin ? "ผู้ดูแลระบบ (Admin)" : "พว. สมศรี ใจดี (บุคลากร)",
          department: isAdmin ? "ศูนย์คอมพิวเตอร์และสารสนเทศ" : "กลุ่มงานการพยาบาล",
          role: (isAdmin ? "admin" : "user") as any,
          username: username.split("@")[0],
          email: username,
        }
        localStorage.setItem("user", JSON.stringify(mockUser))
        localStorage.setItem("token", "offline-mock")
        setCurrentUser(mockUser)
      } else {
        // Check registered users stored in localStorage
        const registeredRaw = localStorage.getItem("registered_users")
        const registeredUsers: Array<{email?: string; username: string; password: string; name: string; id: string; department: string}> = registeredRaw ? JSON.parse(registeredRaw) : []
        const found = registeredUsers.find(u => (u.email === username || u.username === username) && u.password === password)
        if (found) {
          const userObj = {
            id: found.id,
            name: found.name,
            department: found.department,
            role: "user" as any,
            username: found.username,
            email: found.email || username,
          }
          localStorage.setItem("user", JSON.stringify(userObj))
          localStorage.setItem("token", "offline-mock")
          setCurrentUser(userObj)
        } else {
          setError(t.invalidLogin)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Register Submit ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")
    setRegSuccess("")

    // 1. รูปแบบอีเมลถูกต้อง
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(regUsername.trim())) {
      setRegError("รูปแบบอีเมลไม่ถูกต้อง กรุณาระบุอีเมลที่มีอยู่จริง เช่น name@example.com")
      return
    }

    // 2. โดเมนต้องไม่ใช่โดเมนปลอม / ไม่มีตัวอักษรที่ผิดปกติ
    const domain = regUsername.trim().split("@")[1]?.toLowerCase() || ""
    const fakeDomains = ["test.com", "fake.com", "example.com", "dummy.com", "temp.com", "mailinator.com", "guerrillamail.com", "throwam.com", "yopmail.com", "trashmail.com"]
    if (fakeDomains.includes(domain)) {
      setRegError("กรุณาใช้อีเมลที่มีอยู่จริง ไม่อนุญาตให้ใช้อีเมลชั่วคราวหรืออีเมลทดสอบ")
      return
    }

    // 3. ตรวจสอบอีเมลซ้ำในระบบ
    const emailExists = users.some(
      (u) => (u.email?.toLowerCase() === regUsername.trim().toLowerCase()) || (u.username.toLowerCase() === regUsername.trim().toLowerCase())
    )
    if (emailExists) {
      setRegError("อีเมลนี้มีผู้ใช้งานลงทะเบียนแล้ว กรุณาใช้อีเมลอื่น")
      return
    }

    // 4. ตรวจสอบชื่อ-นามสกุลซ้ำในระบบ
    const nameExists = users.some(
      (u) => u.name.trim().toLowerCase() === regFullName.trim().toLowerCase()
    )
    if (nameExists) {
      setRegError("ชื่อ-นามสกุลนี้มีผู้ใช้งานในระบบแล้ว หากเป็นบัญชีของคุณกรุณาเข้าสู่ระบบ หรือติดต่อผู้ดูแลระบบ")
      return
    }

    if (regPassword !== regConfirm) {
      setRegError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน")
      return
    }
    if (!acceptPolicy) {
      setRegError("กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก")
      return
    }
    if (regPassword.length < 6) {
      setRegError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }
    setRegLoading(true)
    try {
      await handleRegisterUser({ email: regUsername, username: regUsername.split("@")[0], password: regPassword, name: regFullName })
      // Save to localStorage for offline login validation
      const registeredRaw = localStorage.getItem("registered_users")
      const existing: Array<{email?: string; username: string; password: string; name: string; id: string; department: string}> = registeredRaw ? JSON.parse(registeredRaw) : []
      const newEntry = { id: "u" + Date.now(), email: regUsername, username: regUsername.split("@")[0], password: regPassword, name: regFullName, department: "" }
      localStorage.setItem("registered_users", JSON.stringify([...existing, newEntry]))
      setRegSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ")
      setTimeout(() => {
        setMode("login")
        setRegSuccess("")
        setUsername(regUsername)
      }, 1500)
    } catch {
      setRegSuccess("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ")
      setTimeout(() => {
        setMode("login")
        setRegSuccess("")
        setUsername(regUsername)
      }, 1500)
    } finally {
      setRegLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900 select-none">
      {/* ─── Top Hospital Header Bar ─── */}
      <header className="relative z-30 w-full bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-200/80 dark:border-slate-800 px-3 md:px-6 py-2 md:py-2.5 shadow-sm">
        <div className="w-full flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="h-10 w-10 md:h-14 md:w-14 flex-none rounded-full bg-white p-0.5 md:p-1 shadow-md border border-sky-200/80 dark:border-slate-700">
              <img src="/logo.png" alt={t.appName} className="h-full w-full object-contain rounded-full" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-2xl lg:text-3xl font-black tracking-tight text-[#1e3a8a] dark:text-sky-300 truncate">{t.appName}</h1>
              <p className="text-[10px] md:text-sm font-semibold text-sky-700 dark:text-sky-400 truncate">{t.appDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-none">
            <div className="hidden lg:flex items-center gap-2 text-sky-900 dark:text-sky-200 bg-white/85 dark:bg-slate-800/90 px-3.5 py-2 rounded-full border border-sky-200/80 dark:border-slate-700 text-xs md:text-sm font-bold shadow-xs">
              <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>{t.phoneLabel} : 02-199-3791-2</span>
            </div>
            {onBackToHome && (
              <button type="button" onClick={onBackToHome} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer">
                <span>←</span>
                <span>{t.homeNav || "หน้าหลัก"}</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 md:gap-2.5">
              <LanguageSwitcher variant="floating" />
              <ThemeToggle variant="inline" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Hero Area ─── */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {backgrounds.map((bg, idx) => (
            <div
              key={bg.src}
              className={`absolute inset-0 bg-no-repeat transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? "opacity-100" : "opacity-0"}`}
              style={bg.style}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-900/20" />
        </div>

        {/* Arrow Navigation */}
        <button type="button" onClick={() => setBgIndex((prev) => (prev - 1 + backgrounds.length) % backgrounds.length)} className="absolute left-4 z-20 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => setBgIndex((prev) => (prev + 1) % backgrounds.length)} className="absolute right-4 z-20 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95">
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {backgrounds.map((_, idx) => (
            <button key={idx} type="button" onClick={() => setBgIndex(idx)} className={`h-2.5 rounded-full transition-all cursor-pointer ${idx === bgIndex ? "w-6 bg-white shadow-sm" : "w-2.5 bg-white/40 hover:bg-white/70"}`} />
          ))}
        </div>

        <VideoWidget />
        <DoctorWaiAvatar />

        {/* ─── Card ─── */}
        <div className="relative z-20 w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-300 my-auto">

          {/* Logo */}
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-1 shadow-lg shadow-blue-600/25">
              <img src="/logo.png" alt="Hospital Logo" className="h-full w-full object-contain rounded-xl bg-white p-1" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.appName}</p>
          </div>

          {mode === "login" ? (
            /* ────── LOGIN FORM ────── */
            <>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white text-center mb-5 flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5 text-blue-600" />
                {t.loginTitle}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="อีเมล" required className={inputClass} />
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} required className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => alert(t.contactAdmin)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {t.forgotPassword}
                  </button>
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 flex-none" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer">
                  <LogIn className="h-4 w-4" />
                  <span>{loading ? t.loggingIn : t.loginBtn}</span>
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                ยังไม่มีบัญชี?{" "}
                <button type="button" onClick={() => { setMode("register"); setError("") }} className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  สมัครสมาชิก
                </button>
              </p>
            </>
          ) : (
            /* ────── REGISTER FORM ────── */
            <>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white text-center mb-5 flex items-center justify-center gap-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                สมัครสมาชิก
              </h2>
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="email" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="อีเมล" required className={inputClass} />
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type={showRegPass ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="รหัสผ่าน" required className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowRegPass((v) => !v)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type={showRegConfirm ? "text" : "password"} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="ยืนยันรหัสผ่าน" required className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowRegConfirm((v) => !v)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="ชื่อ นามสกุล" required className={inputClass} />
                </div>

                {/* Accept Policy Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={acceptPolicy}
                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer flex-none"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ยอมรับข้อตกลง{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="font-bold text-green-700 dark:text-green-400 hover:underline cursor-pointer"
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>
                  </span>
                </label>

                {regError && (
                  <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 flex-none" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="rounded-2xl bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900/60 p-3 text-xs font-semibold text-green-700 dark:text-green-300 text-center">
                    {regSuccess}
                  </div>
                )}

                <button type="submit" disabled={regLoading} className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer">
                  <UserPlus className="h-4 w-4" />
                  <span>{regLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}</span>
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                <button type="button" onClick={() => { setMode("login"); setRegError(""); setRegSuccess("") }} className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  เข้าสู่ระบบ
                </button>
                {" / "}
                <button type="button" onClick={() => alert(t.contactAdmin)} className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  ลืมรหัสผ่าน
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}
export default LoginView
