import React from "react"
import {
  Plus,
  Calendar as CalendarIcon,
  DoorOpen,
  UserPlus,
  RefreshCw,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { LanguageSwitcher } from "../common/LanguageSwitcher"
import { ThemeToggle } from "../common/ThemeToggle"

interface HeaderProps {
  activeTab: string
  onOpenBookingModal: () => void
  onOpenRoomModal: () => void
  onOpenUserModal: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenBookingModal,
  onOpenRoomModal,
  onOpenUserModal,
}) => {
  const { t, language, currentUser, refreshData, loading } = useApp()
  const isAdmin = currentUser?.role === "admin"

  const titles: Record<string, { title: string subtitle: string }> = {
    dashboard: {
      title: t.dashboard,
      subtitle: `${t.appName} — ${t.appDesc}`,
    },
    calendar: {
      title: t.calendar,
      subtitle: t.scheduleTimeline,
    },
    bookings: {
      title: isAdmin ? t.allBookings : t.myBookings,
      subtitle: `${
        isAdmin
          ? "จัดการและตรวจสอบการจองห้องประชุมทั้งหมด"
          : "ประวัติและสถานะคำขอจองห้องประชุมของคุณ"
      }`,
    },
    rooms: {
      title: t.rooms,
      subtitle: "รายละเอียดห้องประชุม อุปกรณ์ และสถานะการใช้งาน",
    },
    users: {
      title: t.users,
      subtitle: "จัดการข้อมูลบุคลากรและกำหนดสิทธิ์ผู้ใช้งาน",
    },
    settings: {
      title: t.settings,
      subtitle: t.systemPreferences,
    },
  }

  const currentMeta = titles[activeTab] || titles.dashboard

  const formatDate = (lang: string) => {
    const dt = new Date()
    return dt.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>{currentMeta.title}</span>
        </h1>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
          <CalendarIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>{formatDate(language)}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="truncate">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          title="Refresh Data"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`}
          />
        </button>

        <LanguageSwitcher variant="header" />
        <ThemeToggle variant="inline" />

        {activeTab === "rooms" && isAdmin ? (
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addRoom}</span>
          </button>
        ) : activeTab === "users" && isAdmin ? (
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.addUser}</span>
          </button>
        ) : activeTab !== "settings" ? (
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.bookRoom}</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
export default Header
