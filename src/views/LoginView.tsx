import React, { useState, useEffect } from "react"
import {
  LogIn,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { LanguageSwitcher } from "../components/common/LanguageSwitcher"
import { ThemeToggle } from "../components/common/ThemeToggle"
import { VideoWidget } from "../components/common/VideoWidget"
import * as api from "../services/api"

export const LoginView: React.FC = () => {
  const { t, setCurrentUser } = useApp()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bgIndex, setBgIndex] = useState(0)

  const backgrounds = [
    "/backgrounds/Picture 1.jpg",
    "/backgrounds/Picture 2.jpg",
    "/backgrounds/Picture 3.png",
    "/backgrounds/Picture 4.jpg",
    "/backgrounds/Picture 5.jpg",
    "/backgrounds/Picture 6.jpg",
    "/backgrounds/Picture 7.jpg",
    "/backgrounds/Picture 8.jpg",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [backgrounds.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.login(username, password)
      setCurrentUser(res.user as any)
    } catch (err: any) {
      // Mock fallback if offline
      if (
        (username === "Admin" && password === "Admin123456") ||
        (username === "Test" && password === "Test123456")
      ) {
        const mockUser = {
          id: username === "Admin" ? "u1" : "u2",
          name:
            username === "Admin" ? "ผู้ดูแลระบบ (Admin)" : "พว. สมศรี ใจดี (บุคลากร)",
          department:
            username === "Admin"
              ? "ศูนย์คอมพิวเตอร์และสารสนเทศ"
              : "กลุ่มงานการพยาบาล",
          role: (username === "Admin" ? "admin" : "user") as any,
          username,
        }
        localStorage.setItem("user", JSON.stringify(mockUser))
        localStorage.setItem("token", "mock-token-" + Date.now())
        setCurrentUser(mockUser)
      } else {
        setError(t.invalidLogin)
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 overflow-x-hidden select-none">
      {/* Background Slideshow Container (Fixed full screen, sharp & perfectly fitted) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {backgrounds.map((bg, idx) => (
          <div
            key={bg}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              idx === bgIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url('${bg}')` }}
          />
        ))}

        {/* Subtle, clear overlay - preserves photo clarity and sharpness while keeping UI readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/30 to-slate-900/15" />
      </div>

      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <LanguageSwitcher variant="floating" />
        <ThemeToggle variant="inline" />
      </div>

      {/* Floating Video Widget */}
      <VideoWidget />

      {/* Main Login Card */}
      <div className="relative z-20 w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-1 shadow-xl shadow-blue-600/30">
            <img
              src="/logo.png"
              alt="Hospital Logo"
              className="h-full w-full object-contain rounded-2xl bg-white p-1"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.loginTitle}
          </h2>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {t.appName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.loginSubTitle}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.username}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                required
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
              />
              <UserIcon className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-12 py-3.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
              />
              <Lock className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => alert(t.contactAdmin)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.forgotPassword}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? t.loggingIn : t.loginBtn}</span>
          </button>
        </form>

        {/* Quick Demo Credentials for Convenience */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
            บัญชีทดสอบระบบ (Quick Test Accounts)
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("Admin", "Admin123456")}
              className="rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-slate-700 transition-colors"
            >
              👑 ผู้ดูแลระบบ (Admin)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("Test", "Test123456")}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              👨‍⚕️ บุคลากรทั่วไป (Staff)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LoginView
