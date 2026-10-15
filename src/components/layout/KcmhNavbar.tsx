import React from "react"
import { useNavigate } from "react-router-dom"
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
  ClipboardCheck,
  Building2,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { LanguageSwitcher } from "../common/LanguageSwitcher"
import { ThemeToggle } from "../common/ThemeToggle"
import { formatUserName, formatDepartment } from "../../constants/translations"

interface KcmhNavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

type IconType = React.ComponentType<{ className?: string }>

interface NavItem {
  id: string
  label: string
  description?: string
  icon: IconType
  active: boolean
  badge?: number
  onClick: () => void
  /** Only show in the mobile drawer (e.g. profile — desktop has the profile pill) */
  mobileOnly?: boolean
}

interface NavGroup {
  id: string
  label: string
  icon: IconType
  items: NavItem[]
}

/* ─────────────────────────── Desktop dropdown ─────────────────────────── */

interface NavDropdownProps {
  group: NavGroup
  open: boolean
  onToggle: () => void
  onClose: () => void
}

const NavDropdown: React.FC<NavDropdownProps> = ({ group, open, onToggle, onClose }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const isGroupActive = group.items.some((i) => i.active)
  const totalBadge = group.items.reduce((sum, i) => sum + (i.badge || 0), 0)
  const GroupIcon = group.icon

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, onClose])

  return (
    <div className="relative" ref={ref}>
      <button
        id={`nav-group-${group.id}`}
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
          isGroupActive || open
            ? "bg-white/20 text-white shadow-inner font-bold"
            : "text-purple-200 hover:bg-white/10 hover:text-white"
        }`}
      >
        <GroupIcon className="h-4 w-4" />
        <span>{group.label}</span>
        {totalBadge > 0 && (
          <span className="px-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black leading-4">
            {totalBadge}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {group.label}
          </p>
          {group.items.map((item) => {
            const ItemIcon = item.icon
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                role="menuitem"
                type="button"
                onClick={() => {
                  item.onClick()
                  onClose()
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  item.active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg transition-colors ${
                    item.active
                      ? "bg-white/20 text-white"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60"
                  }`}
                >
                  <ItemIcon className="h-4 w-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{item.label}</span>
                  {item.description && (
                    <span
                      className={`block text-[11px] truncate ${
                        item.active ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  )}
                </span>
                {!!item.badge && item.badge > 0 && (
                  <span className="px-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black leading-4">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────── Navbar ─────────────────────────────── */

export const KcmhNavbar: React.FC<KcmhNavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { t, language, currentUser, setCurrentUser, bookings } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)
  const closeGroup = React.useCallback(() => setOpenGroup(null), [])

  const isAdmin = currentUser?.role === "admin"
  const pendingCount = bookings.filter((b) => b.status === "pending").length
  const th = language === "th"

  const userDisplayName = React.useMemo(() => {
    return formatUserName(currentUser, language)
  }, [currentUser, language])

  const userDepartment = React.useMemo(() => {
    return formatDepartment(currentUser?.department, currentUser?.role, language)
  }, [currentUser, language])

  const tabToPath = (tabId: string): string => {
    if (tabId === "dashboard" || tabId === "home") {
      return currentUser ? "/dashboard" : "/"
    }
    const map: Record<string, string> = {
      rooms: "/rooms",
      bookings: "/bookings",
      users: "/users",
      settings: "/settings",
      profile: "/profile",
      evaluation: "/evaluation",
      about: "/about",
      login: "/login",
      register: "/register",
    }
    return map[tabId] ?? (currentUser ? "/dashboard" : "/")
  }

  const navigate = useNavigate()

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId) // keep for highlight sync
    navigate(tabToPath(tabId))
    setMobileMenuOpen(false)
  }

  const handleScheduleClick = () => {
    const scrollToSchedule = () => {
      document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    if (activeTab !== "dashboard" && activeTab !== "home") {
      navigate(tabToPath("dashboard"))
      setTimeout(scrollToSchedule, 400)
    } else {
      setTimeout(scrollToSchedule, 50)
    }
    setMobileMenuOpen(false)
  }

  /* ── Menu structure (grouped) ── */
  const homeItem: NavItem = {
    id: "dashboard",
    label: t.homeNav || "หน้าหลัก",
    icon: Home,
    active: activeTab === "dashboard" || activeTab === "home",
    onClick: () => handleNavClick("dashboard"),
  }

  const scheduleItem: NavItem = {
    id: "schedule",
    label: t.schedule || "กำหนดการ",
    icon: CalendarDays,
    active: false,
    onClick: handleScheduleClick,
  }

  const groups: NavGroup[] = [
    {
      id: "booking",
      label: th ? "การจองห้อง" : "Booking",
      icon: DoorOpen,
      items: [
        {
          id: "rooms",
          label: t.bookRoomsNav || "จองห้องประชุม",
          description: th ? "เลือกห้องและทำรายการจอง" : "Pick a room and book",
          icon: DoorOpen,
          active: activeTab === "rooms",
          onClick: () => handleNavClick("rooms"),
        },
        ...(currentUser
          ? [
              {
                id: "bookings",
                label: isAdmin ? t.allBookings : t.myBookings,
                description: isAdmin
                  ? th ? "ตรวจสอบและอนุมัติคำขอจอง" : "Review and approve requests"
                  : th ? "ติดตามสถานะการจองของคุณ" : "Track your booking status",
                icon: ClipboardList,
                active: activeTab === "bookings",
                badge: isAdmin ? pendingCount : 0,
                onClick: () => handleNavClick("bookings"),
              },
            ]
          : []),
      ],
    },
    {
      id: "manage",
      label: isAdmin ? (th ? "ผู้ดูแลระบบ" : "Admin") : th ? "บัญชีของฉัน" : "My Account",
      icon: isAdmin ? ShieldCheck : UserIcon,
      items: [
        ...(isAdmin
          ? [
              {
                id: "users",
                label: t.users,
                description: th ? "อนุมัติและกำหนดสิทธิ์ผู้ใช้" : "Approve users and roles",
                icon: Users,
                active: activeTab === "users",
                onClick: () => handleNavClick("users"),
              },
            ]
          : []),
        ...(currentUser
          ? [
              {
                id: "profile",
                label: th ? "ข้อมูลส่วนตัว" : "Profile",
                description: th ? "แก้ไขข้อมูลและรหัสผ่าน" : "Edit details and password",
                icon: UserIcon,
                active: activeTab === "profile",
                mobileOnly: true,
                onClick: () => handleNavClick("profile"),
              },
              {
                id: "settings",
                label: t.settings,
                description: th ? "ตั้งค่าการใช้งานระบบ" : "System preferences",
                icon: Settings,
                active: activeTab === "settings",
                onClick: () => handleNavClick("settings"),
              },
            ]
          : []),
      ],
    },
    {
      id: "more",
      label: th ? "เพิ่มเติม" : "More",
      icon: LayoutGrid,
      items: [
        {
          id: "evaluation",
          label: th ? "แบบประเมิน" : "Survey",
          description: th ? "ประเมินความพึงพอใจการใช้งาน" : "Rate your experience",
          icon: ClipboardCheck,
          active: activeTab === "evaluation",
          onClick: () => handleNavClick("evaluation"),
        },
        ...(!currentUser
          ? [
              {
                id: "about",
                label: th ? "เกี่ยวกับเรา" : "About Us",
                description: th ? "ข้อมูลโรงพยาบาลสามโคก" : "About Samkhok Hospital",
                icon: Building2,
                active: activeTab === "about",
                onClick: () => handleNavClick("about"),
              },
            ]
          : []),
      ],
    },
  ]

  const desktopGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.mobileOnly) }))
    .filter((g) => g.items.length > 0)
  const mobileGroups = groups.filter((g) => g.items.length > 0)

  const plainBtnClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
      active
        ? "bg-white/20 text-white shadow-inner font-bold"
        : "text-purple-200 hover:bg-white/10 hover:text-white"
    }`

  const renderPlainButton = (item: NavItem) => {
    const Icon = item.icon
    return (
      <button key={item.id} id={`nav-${item.id}`} onClick={item.onClick} className={plainBtnClass(item.active)}>
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className="px-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black leading-4">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  const mobileItemClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
      active ? "bg-white/20 text-white font-bold" : "text-purple-200 hover:bg-white/10"
    }`

  const renderMobileItem = (item: NavItem) => {
    const Icon = item.icon
    return (
      <button key={item.id} onClick={item.onClick} className={mobileItemClass(item.active)}>
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full select-none bg-gradient-to-r from-[#1b0738] via-[#2f0e54] to-[#1a0836] border-b border-purple-900/60 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu + Theme & Language */}
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
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

          <div className="hidden sm:flex items-center gap-1.5">
            <ThemeToggle variant="inline" />
            <LanguageSwitcher variant="floating" />
          </div>
        </div>

        {/* Center: Desktop Nav (grouped dropdowns) */}
        <div className="hidden md:flex flex-1 items-center justify-center mx-2">
          <nav className="flex items-center gap-1">
            {renderPlainButton(homeItem)}
            {desktopGroups.map((group) => (
              <React.Fragment key={group.id}>
                {group.items.length === 1 ? (
                  renderPlainButton(group.items[0])
                ) : (
                  <NavDropdown
                    group={group}
                    open={openGroup === group.id}
                    onToggle={() => setOpenGroup((g) => (g === group.id ? null : group.id))}
                    onClose={closeGroup}
                  />
                )}
                {/* กำหนดการ — ปุ่มแยก ต่อจากเมนูการจองห้อง */}
                {group.id === "booking" && renderPlainButton(scheduleItem)}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Side: Profile / Login */}
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          {/* User Profile Pill when logged in */}
          {currentUser ? (
            <div
              onClick={() => handleNavClick("profile")}
              title={th ? "แก้ไขข้อมูลส่วนตัว" : "Edit Profile"}
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
                  navigate("/")
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
        </div>
      </div>

      {/* Mobile Drawer Menu (grouped with section headings) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-purple-800/60 bg-[#1f0a42] space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {renderMobileItem(homeItem)}
          {renderMobileItem(scheduleItem)}

          {mobileGroups.map((group) => (
            <div key={group.id} className="pt-2 space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                {group.label}
              </p>
              {group.items.map(renderMobileItem)}
            </div>
          ))}

          <div className="pt-2">
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
        </div>
      )}
    </header>
  )
}
export default KcmhNavbar
