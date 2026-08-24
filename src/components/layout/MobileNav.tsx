import React from "react"
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Users,
  Settings,
  LogOut,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { formatUserName } from "../../constants/translations"

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { t, language, currentUser, setCurrentUser, bookings } = useApp()

  if (!currentUser) return null

  const isAdmin = currentUser.role === "admin"
  const pendingCount = bookings.filter((b) => b.status === "pending").length

  const navItems = [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "calendar", label: t.calendar, icon: CalendarDays },
    {
      id: "bookings",
      label: isAdmin ? t.allBookings : t.myBookings,
      icon: ClipboardList,
      badge: isAdmin && pendingCount > 0 ? pendingCount : undefined,
    },
    { id: "rooms", label: t.rooms, icon: DoorOpen },
    ...(isAdmin ? [{ id: "users", label: t.users, icon: Users }] : []),
    { id: "settings", label: t.settings, icon: Settings },
  ]

  return (
    <div className="md:hidden flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors shadow-xs">
      {/* Mobile Top App Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {t.appName}
            </h2>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
              {t.appDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img
            src="/user.jpg"
            alt="User"
            className="h-7 w-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
            onError={(e) => {
              const target = e.currentTarget
              if (!target.dataset.triedImage) {
                target.dataset.triedImage = "true"
                target.src = "/Image/user.jpg"
              }
            }}
          />
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {formatUserName(currentUser, language).split(" ")[0]}
          </span>
          <button
            onClick={() => setCurrentUser(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Nav Bar */}
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-none items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
export default MobileNav
