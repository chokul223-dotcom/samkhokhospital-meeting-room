import React, { useEffect, useMemo, useState } from "react"
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
  X,
  ClipboardCheck,
  ChartColumn,
  Building2,
  ChevronDown,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  UserPlus,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { formatUserName, formatDepartment } from "../../constants/translations"

export interface KcmhSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  mobileOpen: boolean
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type IconType = React.ComponentType<{ className?: string }>

interface SidebarItem {
  id: string
  label: string
  description?: string
  icon: IconType
  active: boolean
  badge?: number
  onClick: () => void
}

export const KcmhSidebar: React.FC<KcmhSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { t, language, currentUser, setCurrentUser, bookings, users } = useApp()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(true)

  const isAdmin = currentUser?.role === "admin"
  const pendingCount = bookings.filter((b) => b.status === "pending").length
  const pendingUsersCount = isAdmin
    ? users.filter(
        (u) =>
          !u.department || u.department === "รอการตรวจสอบ" || u.department === "-",
      ).length
    : 0
  const th = language === "th"

  const userDisplayName = useMemo(
    () => formatUserName(currentUser, language),
    [currentUser, language]
  )

  const userDepartment = useMemo(
    () => formatDepartment(currentUser?.department, currentUser?.role, language),
    [currentUser, language]
  )

  useEffect(() => {
    if (!mobileOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [mobileOpen, setMobileOpen])

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
      "evaluation-results": "/evaluation-results",
      about: "/about",
      login: "/login",
      register: "/register",
    }
    return map[tabId] ?? (currentUser ? "/dashboard" : "/")
  }

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId)
    navigate(tabToPath(tabId))
    setMobileOpen(false)
  }

  const handleScheduleClick = () => {
    const scrollToSchedule = () => {
      document
        .getElementById("schedule-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    if (activeTab !== "dashboard" && activeTab !== "home") {
      navigate(tabToPath("dashboard"))
      setTimeout(scrollToSchedule, 400)
    } else {
      setTimeout(scrollToSchedule, 50)
    }
    setMobileOpen(false)
  }

  // Primary navigation items
  const primaryItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: t.homeNav || "หน้าหลัก",
      icon: Home,
      active: activeTab === "dashboard" || activeTab === "home",
      onClick: () => handleNavClick("dashboard"),
    },
    {
      id: "rooms",
      label: t.bookRoomsNav || "จองห้องประชุม",
      icon: DoorOpen,
      active: activeTab === "rooms",
      onClick: () => handleNavClick("rooms"),
    },
    {
      id: "schedule",
      label: t.schedule || "กำหนดการ",
      icon: CalendarDays,
      active: false,
      onClick: handleScheduleClick,
    },
    ...(currentUser
      ? [
          {
            id: "bookings",
            label: isAdmin ? t.allBookings : t.myBookings,
            icon: ClipboardList,
            active: activeTab === "bookings",
            badge: isAdmin ? pendingCount : 0,
            onClick: () => handleNavClick("bookings"),
          },
        ]
      : []),
  ]

  // Account & Admin management items (authenticated users)
  const managementItems: SidebarItem[] = currentUser
    ? [
        ...(isAdmin
          ? [
              {
                id: "users",
                label: t.users,
                icon: Users,
                active: activeTab === "users",
                badge: pendingUsersCount,
                onClick: () => handleNavClick("users"),
              },
            ]
          : []),
        {
          id: "profile",
          label: th ? "ข้อมูลส่วนตัว" : "Profile",
          icon: UserIcon,
          active: activeTab === "profile",
          onClick: () => handleNavClick("profile"),
        },
        {
          id: "settings",
          label: t.settings,
          icon: Settings,
          active: activeTab === "settings",
          onClick: () => handleNavClick("settings"),
        },
      ]
    : []

  // "เพิ่มเติม" (More) items with subtitles: แบบประเมิน → ผลประเมิน (Admin) → เกี่ยวกับเรา
  const moreItems: SidebarItem[] = [
    {
      id: "evaluation",
      label: th ? "แบบประเมิน" : "Survey",
      description: th ? "ประเมินความพึงพอใจการใช้งาน" : "Rate your experience",
      icon: ClipboardCheck,
      active: activeTab === "evaluation",
      onClick: () => handleNavClick("evaluation"),
    },
    ...(isAdmin
      ? [
          {
            id: "evaluation-results",
            label: th ? "ผลประเมิน" : "Results",
            description: th ? "สรุปสถิติและคะแนนประเมิน" : "View satisfaction stats",
            icon: ChartColumn,
            active: activeTab === "evaluation-results",
            onClick: () => handleNavClick("evaluation-results"),
          },
        ]
      : []),
    {
      id: "about",
      label: th ? "เกี่ยวกับเรา" : "About Us",
      description: th ? "ข้อมูลโรงพยาบาลสามโคก" : "About Samkhok Hospital",
      icon: Building2,
      active: activeTab === "about",
      onClick: () => handleNavClick("about"),
    },
  ]

  const isMoreActive = moreItems.some((item) => item.active)

  const renderPrimaryItem = (item: SidebarItem, isCompact: boolean) => {
    const Icon = item.icon
    return (
      <button
        key={item.id}
        id={`nav-${item.id}`}
        type="button"
        onClick={item.onClick}
        title={isCompact ? item.label : undefined}
        className={`group relative flex w-full items-center rounded-2xl transition-all duration-200 cursor-pointer ${
          isCompact ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-2.5"
        } ${
          item.active
            ? "bg-gradient-to-r from-violet-600/95 via-purple-600/90 to-fuchsia-600/85 text-white font-bold shadow-lg shadow-purple-950/50 ring-1 ring-white/20"
            : "text-purple-100/85 hover:bg-white/10 hover:text-white font-medium"
        }`}
      >
        {/* Active left indicator pill */}
        {item.active && !isCompact && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
        )}

        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-xl transition-colors ${
            item.active
              ? "bg-white/20 text-white"
              : "bg-white/5 text-purple-200 group-hover:bg-white/15 group-hover:text-white"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>

        {!isCompact && (
          <span className="flex-1 text-left text-sm truncate">{item.label}</span>
        )}

        {!!item.badge && item.badge > 0 && (
          <span
            className={
              isCompact
                ? "absolute top-1.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-950 ring-2 ring-[#230a45]"
                : "flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-slate-950 shadow-xs"
            }
          >
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  const renderMoreCardItem = (item: SidebarItem, isCompact: boolean) => {
    const Icon = item.icon
    if (isCompact) {
      return renderPrimaryItem(item, true)
    }

    return (
      <button
        key={item.id}
        id={`nav-${item.id}`}
        type="button"
        onClick={item.onClick}
        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 cursor-pointer ${
          item.active
            ? "bg-gradient-to-r from-violet-600/95 via-purple-600/90 to-fuchsia-600/85 text-white shadow-lg shadow-purple-950/40 ring-1 ring-white/20"
            : "bg-white/[0.04] hover:bg-white/10 text-purple-100 border border-white/[0.06] hover:border-white/15"
        }`}
      >
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl transition-colors ${
            item.active
              ? "bg-white/20 text-white"
              : "bg-purple-400/15 text-purple-200 group-hover:bg-purple-400/25 group-hover:text-white"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-bold truncate leading-tight">
            {item.label}
          </span>
          {item.description && (
            <span
              className={`block text-[11px] truncate mt-0.5 ${
                item.active ? "text-purple-100/90" : "text-purple-300/75"
              }`}
            >
              {item.description}
            </span>
          )}
        </span>
      </button>
    )
  }

  const renderSidebarContent = (isCompact: boolean, isMobileDrawer: boolean) => (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#1b0738] via-[#2b0d4f] to-[#14062b] text-white select-none">
      {/* Subtle top ambient glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 -right-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

      {/* ── Brand Header ── */}
      <div
        className={`relative flex items-center border-b border-white/10 ${
          isCompact ? "justify-center px-2 py-4" : "justify-between px-4 py-4"
        }`}
      >
        <button
          type="button"
          onClick={() => handleNavClick("dashboard")}
          className={`flex items-center gap-3 min-w-0 text-left cursor-pointer group ${
            isCompact ? "justify-center" : ""
          }`}
        >
          <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white p-1 shadow-lg shadow-purple-950/60 ring-2 ring-purple-300/30 group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt={t.appName || "โรงพยาบาลสามโคก"}
              className="h-full w-full object-contain"
            />
          </div>
          {!isCompact && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-white truncate leading-tight">
                {t.appName || "โรงพยาบาลสามโคก"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] font-medium text-purple-200/80 truncate">
                  {th ? "ระบบจองห้องประชุมออนไลน์" : "eBooking Online"}
                </p>
              </div>
            </div>
          )}
        </button>

        {/* Mobile close button or Desktop collapse toggle */}
        {isMobileDrawer ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={th ? "ปิดเมนู" : "Close menu"}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-purple-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          !isCompact && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title={th ? "ย่อแถบเมนู" : "Collapse sidebar"}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-purple-300/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* Expand button when collapsed on desktop */}
      {isCompact && !isMobileDrawer && (
        <div className="flex justify-center pt-3 px-2">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title={th ? "ขยายแถบเมนู" : "Expand sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-purple-200 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Scrollable Nav Area ── */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Main Menu */}
        <div className="space-y-1.5">
          {!isCompact && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-purple-300/70">
              {th ? "เมนูหลัก" : "Main Menu"}
            </p>
          )}
          {primaryItems.map((item) => renderPrimaryItem(item, isCompact))}
        </div>

        {/* Account / Admin Section */}
        {managementItems.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            {!isCompact && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-purple-300/70">
                {isAdmin
                  ? th
                    ? "ผู้ดูแลระบบ"
                    : "Administration"
                  : th
                    ? "บัญชีของฉัน"
                    : "My Account"}
              </p>
            )}
            <div className={isCompact ? "pt-2 space-y-1.5" : "space-y-1.5"}>
              {managementItems.map((item) => renderPrimaryItem(item, isCompact))}
            </div>
          </div>
        )}

        {/* "เพิ่มเติม" (More) Collapsible Section */}
        <div className="pt-1 border-t border-white/10">
          {!isCompact ? (
            <>
              <button
                id="nav-group-more"
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className={`mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                  isMoreActive
                    ? "text-white bg-white/10"
                    : "text-purple-200/85 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5 text-purple-300" />
                  <span>{th ? "เพิ่มเติม" : "More"}</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-purple-300 transition-transform duration-200 ${
                    moreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {moreOpen && (
                <div className="mt-2 space-y-2">
                  {moreItems.map((item) => renderMoreCardItem(item, false))}
                </div>
              )}
            </>
          ) : (
            <div className="pt-2 space-y-1.5">
              {moreItems.map((item) => renderMoreCardItem(item, true))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Pinned Footer: Login CTA or User Profile Card ── */}
      <div className="relative p-3 border-t border-white/10 bg-black/20">
        {currentUser ? (
          isCompact ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavClick("profile")}
                title={userDisplayName}
                className={`h-10 w-10 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "border-white ring-2 ring-violet-400/60"
                    : "border-purple-400/40 hover:border-white"
                }`}
              >
                <img
                  src={currentUser.avatarUrl || "/user.jpg"}
                  alt={userDisplayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png"
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null)
                  setMobileOpen(false)
                  navigate("/")
                }}
                title={t.logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-purple-300 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                onClick={() => handleNavClick("profile")}
                title={th ? "แก้ไขข้อมูลส่วนตัว" : "Edit Profile"}
                className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-white/20 border-white/35 shadow-inner"
                    : "bg-white/10 hover:bg-white/15 border-white/10"
                }`}
              >
                <div className="h-10 w-10 flex-none rounded-xl overflow-hidden bg-purple-900 border border-purple-400/40">
                  <img
                    src={currentUser.avatarUrl || "/user.jpg"}
                    alt={userDisplayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png"
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {userDisplayName}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] text-purple-200/80 truncate mt-0.5">
                    {isAdmin && (
                      <ShieldCheck className="h-3 w-3 flex-none text-emerald-300" />
                    )}
                    <span className="truncate">
                      {isAdmin ? t.admin : userDepartment}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentUser(null)
                    setMobileOpen(false)
                    navigate("/")
                  }}
                  title={t.logout}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-purple-200/80 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        ) : isCompact ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleNavClick("login")}
              title={t.loginNav || "เข้าสู่ระบบ"}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <LogIn className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick("login")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{t.loginNav || "เข้าสู่ระบบ"}</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("register")}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-semibold text-purple-200/85 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>
                {th ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "New here? Register"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen flex-none border-r border-purple-900/60 shadow-2xl shadow-purple-950/20 z-40 transition-[width] duration-300 ease-out ${
          collapsed ? "w-[78px]" : "w-[268px]"
        }`}
      >
        {renderSidebarContent(collapsed, false)}
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-[276px] max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent(false, true)}
          </aside>
        </div>
      )}
    </>
  )
}

export default KcmhSidebar
