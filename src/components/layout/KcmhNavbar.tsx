import React from "react"
import { useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import { useApp } from "../../context/AppContext"
import { LanguageSwitcher } from "../common/LanguageSwitcher"
import { ThemeToggle } from "../common/ThemeToggle"

interface KcmhNavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onOpenMobileMenu?: () => void
}

export const KcmhNavbar: React.FC<KcmhNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const { t, language, currentUser } = useApp()
  const navigate = useNavigate()
  const th = language === "th"
  const isAdmin = currentUser?.role === "admin"

  const pageTitleMap: Record<string, string> = {
    dashboard: t.homeNav || (th ? "หน้าหลัก" : "Home"),
    home: t.homeNav || (th ? "หน้าหลัก" : "Home"),
    rooms: t.bookRoomsNav || (th ? "จองห้องประชุม" : "Book Rooms"),
    bookings: isAdmin
      ? t.allBookings || (th ? "รายการจองทั้งหมด" : "All Bookings")
      : t.myBookings || (th ? "การจองของฉัน" : "My Bookings"),
    users: t.users || (th ? "จัดการผู้ใช้งาน" : "Users"),
    settings: t.settings || (th ? "ตั้งค่า" : "Settings"),
    profile: th ? "ข้อมูลส่วนตัว" : "Profile",
    evaluation: th ? "แบบประเมินความพึงพอใจ" : "Satisfaction Survey",
    "evaluation-results": th ? "ผลประเมินความพึงพอใจ" : "Evaluation Results",
    about: th ? "เกี่ยวกับเรา" : "About Us",
  }

  const currentPageLabel =
    pageTitleMap[activeTab] || (th ? "หน้าหลัก" : "Home")

  const handleGoHome = () => {
    setActiveTab("dashboard")
    navigate(currentUser ? "/dashboard" : "/")
  }

  return (
    <header className="sticky top-0 z-30 w-full select-none bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Trigger + Compact Brand (< lg) OR Page Title (lg+) */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label={th ? "เปิดเมนูนำทาง" : "Open Navigation"}
              className="lg:hidden flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-purple-950 text-white hover:bg-purple-900 dark:bg-purple-900/80 dark:hover:bg-purple-800 shadow-xs transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Compact hospital brand on mobile & tablet */}
          <button
            type="button"
            onClick={handleGoHome}
            className="flex lg:hidden items-center gap-2 min-w-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt={t.appName || "โรงพยาบาลสามโคก"}
              className="h-7 w-7 rounded-full bg-white p-0.5 object-contain shadow-xs flex-none"
            />
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white truncate">
              {t.appName || "โรงพยาบาลสามโคก"}
            </span>
          </button>

          {/* Desktop subtle page indicator */}
          <div className="hidden lg:flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-xs flex-none" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
              {currentPageLabel}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle & Language Switcher */}
        <div className="flex items-center gap-2 flex-none">
          <ThemeToggle variant="inline" />
          <LanguageSwitcher variant="floating" />
        </div>
      </div>
    </header>
  )
}

export default KcmhNavbar
