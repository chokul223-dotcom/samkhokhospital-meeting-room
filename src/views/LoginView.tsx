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
    {
      src: "/backgrounds/Picture 1.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 1.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundColor: "#d6aa49",
      },
    },
    {
      src: "/backgrounds/Picture 2.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 2.jpg')",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundColor: "#a98a75",
      },
    },
    {
      src: "/backgrounds/Picture 3.png",
      style: {
        backgroundImage: "url('/backgrounds/Picture 3.png')",
        backgroundPosition: "center center",
        backgroundSize: "contain",
        backgroundColor: "#124b48",
      },
    },
    {
      src: "/backgrounds/Picture 4.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 4.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      },
    },
    {
      src: "/backgrounds/Picture 5.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 5.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      },
    },
    {
      src: "/backgrounds/Picture 6.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 6.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      },
    },
    {
      src: "/backgrounds/Picture 7.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 7.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      },
    },
    {
      src: "/backgrounds/Picture 8.jpg",
      style: {
        backgroundImage: "url('/backgrounds/Picture 8.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      },
    },
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
            username === "Admin"
              ? "ผู้ดูแลระบบ (Admin)"
              : "พว. สมศรี ใจดี (บุคลากร)",
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900 select-none">
      {/* ─── Top Hospital Header Bar ─── */}
      <header className="relative z-30 w-full bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-sky-200/80 dark:border-slate-800 px-3 md:px-6 py-2 md:py-2.5 shadow-sm">
        <div className="w-full flex items-center justify-between gap-2 md:gap-4">
          {/* Hospital Logo & Official Title (Far Left) */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="h-10 w-10 md:h-14 md:w-14 flex-none rounded-full bg-white p-0.5 md:p-1 shadow-md border border-sky-200/80 dark:border-slate-700">
              <img
                src="/logo.png"
                alt={t.appName}
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-2xl lg:text-3xl font-black tracking-tight text-[#1e3a8a] dark:text-sky-300 truncate">
                {t.appName}
              </h1>
              <p className="text-[10px] md:text-sm font-semibold text-sky-700 dark:text-sky-400 truncate">
                {t.appDesc}
              </p>
            </div>
          </div>

          {/* Right Header Info: Phone, Language & Light/Dark Mode Switcher (Far Right) */}
          <div className="flex items-center gap-2 md:gap-4 flex-none">
            {/* Phone contact */}
            <div className="hidden lg:flex items-center gap-2 text-sky-900 dark:text-sky-200 bg-white/85 dark:bg-slate-800/90 px-3.5 py-2 rounded-full border border-sky-200/80 dark:border-slate-700 text-xs md:text-sm font-bold shadow-xs">
              <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>{t.phoneLabel} : 02-199-3791-2</span>
            </div>

            {/* Language & Theme Switchers */}
            <div className="flex items-center gap-1.5 md:gap-2.5">
              <LanguageSwitcher variant="floating" />
              <ThemeToggle variant="inline" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Hero Area with Banner Slideshow & Floating Login Card ─── */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Banner Slideshow Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {backgrounds.map((bg, idx) => (
            <div
              key={bg.src}
              className={`absolute inset-0 bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                idx === bgIndex ? "opacity-100" : "opacity-0"
              }`}
              style={bg.style}
            />
          ))}
          {/* Subtle contrast overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-900/20" />
        </div>

        {/* Banner Slide Navigation Arrows */}
        <button
          type="button"
          onClick={() =>
            setBgIndex(
              (prev) => (prev - 1 + backgrounds.length) % backgrounds.length,
            )
          }
          className="absolute left-4 z-20 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95"
          title="Previous Banner"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() =>
            setBgIndex((prev) => (prev + 1) % backgrounds.length)
          }
          className="absolute right-4 z-20 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95"
          title="Next Banner"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Banner Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {backgrounds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setBgIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === bgIndex
                  ? "w-6 bg-white shadow-sm"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Floating Video Widget */}
        <VideoWidget />

        {/* Main Login Card */}
        <div className="relative z-20 w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-300 my-auto">
          {/* Header Branding inside Card */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-1 shadow-lg shadow-blue-600/25">
              <img
                src="/logo.png"
                alt="Hospital Logo"
                className="h-full w-full object-contain rounded-xl bg-white p-1"
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
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
        </div>
      </div>
    </div>
  )
}
export default LoginView
