import React from "react"
import {
  Home,
  DoorOpen,
  LogIn,
  LogOut,
  CalendarDays,
  ClipboardList,
  Users,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { LanguageSwitcher } from "../common/LanguageSwitcher"
import { ThemeToggle } from "../common/ThemeToggle"
import { formatUserName, formatDepartment } from "../../constants/translations"

interface KcmhNavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const KcmhNavbar: React.FC<KcmhNavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { t, language, currentUser, setCurrentUser, bookings } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const isAdmin = currentUser?.role === "admin"
  const pendingCount = bookings.filter((b) => b.status === "pending").length

  const userDisplayName = React.useMemo(() => {
    return formatUserName(currentUser, language)
  }, [currentUser, language])

  const userDepartment = React.useMemo(() => {
    return formatDepartment(currentUser?.department, currentUser?.role, language)
  }, [currentUser, language])

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
  }

  const handleScheduleClick = () => {
    const scrollToSchedule = () => {
      const el = document.getElementById("schedule-section")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      }
    }

    if (activeTab !== "dashboard" && activeTab !== "home") {
      setActiveTab("dashboard")
      setTimeout(scrollToSchedule, 300)
    } else {
      setTimeout(scrollToSchedule, 50)
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full select-none bg-gradient-to-r from-[#1b0738] via-[#2f0e54] to-[#1a0836] border-b border-purple-900/60 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard" || activeTab === "home"
                  ? "bg-white/20 text-white shadow-inner font-bold"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>{t.homeNav || "หน้าหลัก"}</span>
            </button>

            <button
              onClick={() => handleNavClick("rooms")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "rooms"
                  ? "bg-white/20 text-white shadow-inner font-bold"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <DoorOpen className="h-4 w-4" />
              <span>{t.bookRoomsNav || "จองห้องประชุม"}</span>
            </button>

            <button
              onClick={handleScheduleClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-purple-200 hover:bg-white/10 hover:text-white`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>{t.schedule || "กำหนดการ"}</span>
            </button>

            {/* Authenticated Links */}
            {currentUser && (
              <button
                onClick={() => handleNavClick("bookings")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "bookings"
                    ? "bg-white/20 text-white shadow-inner font-bold"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span>{isAdmin ? t.allBookings : t.myBookings}</span>
                {isAdmin && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && isAdmin && (
              <button
                onClick={() => handleNavClick("users")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-white/20 text-white shadow-inner font-bold"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{t.users}</span>
              </button>
            )}

            {currentUser && (
              <button
                onClick={() => handleNavClick("settings")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-white/20 text-white shadow-inner font-bold"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>{t.settings}</span>
              </button>
            )}

            {/* If NOT logged in, show Login link */}
            {!currentUser && (
              <button
                onClick={() => handleNavClick("login")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-white/20 text-white shadow-inner font-bold"
                    : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>{t.loginNav || "เข้าสู่ระบบ"}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Side: Profile / Login + Theme + Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Pill when logged in */}
          {currentUser ? (
            <div
              onClick={() => handleNavClick("profile")}
              title={language === "th" ? "แก้ไขข้อมูลส่วนตัว" : "Edit Profile"}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-2xl border transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white/25 border-white/40 shadow-inner ring-2 ring-white/20"
                  : "bg-white/10 hover:bg-white/20 border-white/10 active:scale-[0.98]"
              }`}
            >
              <div className="h-7 w-7 rounded-xl overflow-hidden bg-purple-900 border border-purple-400/40 flex-none">
                <img
                  src={currentUser.avatarUrl || "/user.jpg"}
                  alt={userDisplayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png"
                  }}
                />
              </div>
              <div className="hidden sm:block text-left max-w-[130px]">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-purple-300 truncate">
                  {isAdmin ? t.admin : userDepartment}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentUser(null)
                  setActiveTab("dashboard")
                }}
                title={t.logout}
                className="p-1 rounded-lg text-purple-300 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer ml-0.5"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick("login")}
              className="hidden md:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t.loginNav || "เข้าสู่ระบบ"}</span>
            </button>
          )}

          {/* Theme & Language Switchers */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle variant="inline" />
            <LanguageSwitcher variant="floating" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-purple-800/60 bg-[#1f0a42] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
              activeTab === "dashboard"
                ? "bg-white/20 text-white font-bold"
                : "text-purple-200 hover:bg-white/10"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>{t.homeNav || "หน้าหลัก"}</span>
          </button>

          <button
            onClick={() => handleNavClick("rooms")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
              activeTab === "rooms"
                ? "bg-white/20 text-white font-bold"
                : "text-purple-200 hover:bg-white/10"
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            <span>{t.bookRoomsNav || "จองห้องประชุม"}</span>
          </button>

          <button
            onClick={handleScheduleClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-purple-200 hover:bg-white/10`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>{t.schedule || "กำหนดการ"}</span>
          </button>

          {currentUser && (
            <button
              onClick={() => handleNavClick("bookings")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold ${
                activeTab === "bookings"
                  ? "bg-white/20 text-white font-bold"
                  : "text-purple-200 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="h-4 w-4" />
                <span>{isAdmin ? t.allBookings : t.myBookings}</span>
              </div>
              {isAdmin && pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {currentUser && isAdmin && (
            <button
              onClick={() => handleNavClick("users")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                activeTab === "users"
                  ? "bg-white/20 text-white font-bold"
                  : "text-purple-200 hover:bg-white/10"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{t.users}</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => handleNavClick("profile")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                activeTab === "profile"
                  ? "bg-white/20 text-white font-bold"
                  : "text-purple-200 hover:bg-white/10"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>{language === "th" ? "ข้อมูลส่วนตัว" : "Profile"}</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => handleNavClick("settings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                activeTab === "settings"
                  ? "bg-white/20 text-white font-bold"
                  : "text-purple-200 hover:bg-white/10"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{t.settings}</span>
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={() => handleNavClick("login")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white"
            >
              <LogIn className="h-4 w-4" />
              <span>{t.loginNav || "เข้าสู่ระบบ"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentUser(null)
                setActiveTab("dashboard")
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-300 hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}
export default KcmhNavbar
