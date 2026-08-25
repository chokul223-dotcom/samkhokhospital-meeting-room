import React from "react"
import {
  Plus,
  Calendar as CalendarIcon,
  UserPlus,
} from "lucide-react"
import { useApp } from "../../context/AppContext"

interface HeaderProps {
  activeTab: string
  onOpenBookingModal?: () => void
  onOpenRoomModal: () => void
  onOpenUserModal: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenRoomModal,
  onOpenUserModal,
}) => {
  const { t, language, currentUser } = useApp()
  const isAdmin = currentUser?.role === "admin"

  const titles: Record<string, { title: string; subtitle: string }> = {
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
      subtitle: isAdmin ? t.manageAllBookingsDesc : t.myBookingsDesc,
    },
    rooms: {
      title: t.rooms,
      subtitle: t.allRoomsDesc,
    },
    users: {
      title: t.users,
      subtitle: t.allUsersDesc,
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
        {activeTab === "rooms" && isAdmin ? (
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addRoom}</span>
          </button>
        ) : activeTab === "users" && isAdmin ? (
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.addUser}</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
export default Header
