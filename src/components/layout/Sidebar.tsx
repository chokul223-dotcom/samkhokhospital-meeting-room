import React from "react"
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"
import { useApp } from "../../context/AppContext"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
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

  const userDisplayName = React.useMemo(() => {
    if (isAdmin || currentUser.username === "Admin" || currentUser.name.includes("ผู้ดูแลระบบ")) {
      return language === "th" ? "ผู้ดูแลระบบ" : "Administrator"
    }
    if (currentUser.username === "Test" || currentUser.name.includes("สมศรี")) {
      return language === "th" ? "พว. สมศรี ใจดี" : "Nurse Somsri Jaidee"
    }
    return currentUser.name
  }, [currentUser, isAdmin, language])

  const userDepartment = React.useMemo(() => {
    if (isAdmin) return t.admin
    if (currentUser.department === "IT" || currentUser.department === "ศูนย์คอมพิวเตอร์และสารสนเทศ") {
      return language === "th" ? "ศูนย์คอมพิวเตอร์และสารสนเทศ" : "IT & Computer Center"
    }
    if (currentUser.department === "กลุ่มงานการพยาบาล") {
      return language === "th" ? "กลุ่มงานการพยาบาล" : "Nursing Dept"
    }
    return currentUser.department || t.user
  }, [currentUser, isAdmin, language, t])

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-600/30">
            <img
              src="/logo.png"
              alt="Hospital Logo"
              className="h-full w-full object-contain rounded-xl bg-white p-0.5"
            />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
              {t.appName}
            </h1>
            <p className="text-[11px] font-medium text-blue-400">
              {t.appDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-slate-950 shadow-xs">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile Footer with User.jpg Avatar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-800/50 p-3 border border-slate-800">
          <div className="h-10 w-10 flex-none rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
            <img
              src="/user.jpg"
              alt={userDisplayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                if (!target.dataset.triedImage) {
                  target.dataset.triedImage = "true"
                  target.src = "/Image/user.jpg"
                }
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {userDisplayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-300 font-semibold">
                      {t.admin}
                    </span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3 w-3 text-slate-400" />
                    <span>{userDepartment}</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            title={t.logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
