import React, { useMemo } from "react"
import {
  DoorOpen,
  CheckCircle2,
  Clock,
  ClipboardList,
  Calendar,
  Users,
  Building,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { StatCard } from "../components/common/StatCard"
import { Badge } from "../components/common/Badge"

interface DashboardViewProps {
  onNavigateTab: (tab: string, filter?: string) => void
  onOpenBookingModal: (roomId?: string) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenBookingModal,
}) => {
  const { t, rooms, bookings, users, currentUser } = useApp()
  const isAdmin = currentUser?.role === "admin"
  const todayStr = new Date().toISOString().split("T")[0]
  const nowTime = new Date().toTimeString().slice(0, 5)

  const availableRoomsCount = useMemo(
    () => rooms.filter((r) => r.status === "available").length,
    [rooms],
  )

  const todayApprovedBookings = useMemo(
    () =>
      bookings.filter((b) => b.date === todayStr && b.status === "approved"),
    [bookings, todayStr],
  )

  const pendingBookingsCount = useMemo(
    () =>
      isAdmin
        ? bookings.filter((b) => b.status === "pending").length
        : bookings.filter(
            (b) => b.userId === currentUser?.id && b.status === "pending",
          ).length,
    [bookings, isAdmin, currentUser],
  )

  const totalBookingsCount = useMemo(
    () =>
      isAdmin
        ? bookings.length
        : bookings.filter((b) => b.userId === currentUser?.id).length,
    [bookings, isAdmin, currentUser],
  )

  const todaySchedule = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          b.date === todayStr &&
          b.status !== "cancelled" &&
          b.status !== "rejected" &&
          (isAdmin || b.status === "approved"),
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [bookings, todayStr, isAdmin])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome / Quick Action Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl shadow-blue-700/15">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>ยินดีต้อนรับสู่ระบบจองห้องประชุม</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight pt-1">
              สวัสดี, {currentUser?.name}
            </h2>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl">
              โรงพยาบาลสามโคกพร้อมให้บริการห้องประชุม {availableRoomsCount}{" "}
              ห้องสำหรับการประชุมและการอบรมวิชาการ
            </p>
          </div>

          <button
            onClick={() => onOpenBookingModal()}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-lg hover:bg-blue-50 active:scale-95 transition-all"
          >
            <span>{t.bookRoom}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Decorative Background Circles */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 -top-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-xl" />
      </div>

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.roomsReady}
          value={availableRoomsCount}
          icon={DoorOpen}
          colorClass="text-blue-600 dark:text-blue-400"
          iconBgClass="bg-blue-50 dark:bg-blue-950/60"
          subText={`ทั้งหมด ${rooms.length} ห้อง`}
          onClick={() => onNavigateTab("rooms")}
        />
        <StatCard
          label={t.todayBookings}
          value={todayApprovedBookings.length}
          icon={CheckCircle2}
          colorClass="text-emerald-600 dark:text-emerald-400"
          iconBgClass="bg-emerald-50 dark:bg-emerald-950/60"
          subText="อนุมัติพร้อมใช้งาน"
          onClick={() => onNavigateTab("bookings", "today")}
        />
        <StatCard
          label={t.pendingApprovals}
          value={pendingBookingsCount}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          iconBgClass="bg-amber-50 dark:bg-amber-950/60"
          subText={isAdmin ? "ต้องตรวจสอบ" : "รอการตอบรับ"}
          onClick={() => onNavigateTab("bookings", "pending")}
        />
        <StatCard
          label={t.totalBookings}
          value={totalBookingsCount}
          icon={ClipboardList}
          colorClass="text-indigo-600 dark:text-indigo-400"
          iconBgClass="bg-indigo-50 dark:bg-indigo-950/60"
          subText="ประวัติทั้งหมด"
          onClick={() => onNavigateTab("bookings", "all")}
        />
      </div>

      {/* Grid: Today's Schedule & Live Room Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols on large screen) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.todaySchedule}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("calendar")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>ดูปฏิทินเต็ม</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
            {todaySchedule.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Calendar className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs">{t.noMeetingToday}</p>
              </div>
            ) : (
              todaySchedule.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId)
                const user = users.find((u) => u.id === b.userId)
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex flex-col items-center justify-center w-16 flex-none rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                        {b.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {b.endTime}
                      </span>
                    </div>

                    <div className="w-1 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex-none" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {b.purpose}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                          {room?.name}
                        </span>
                        <span>•</span>
                        <span>{user?.name || "บุคลากร"}</span>
                        <span>•</span>
                        <span>
                          {b.attendees} {t.people}
                        </span>
                      </div>
                    </div>

                    <Badge status={b.status} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Live Room Status Grid (1 col on large screen) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.roomStatus}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>สด</span>
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[420px]">
            {rooms.map((room) => {
              const activeBooking = bookings.find(
                (b) =>
                  b.roomId === room.id &&
                  b.date === todayStr &&
                  b.status === "approved" &&
                  b.startTime <= nowTime &&
                  b.endTime > nowTime,
              )
              const isInUse = !!activeBooking
              const isMaintenance = room.status === "maintenance"

              return (
                <div
                  key={room.id}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    isMaintenance
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50"
                      : isInUse
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50"
                        : "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {room.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {room.location} • {room.capacity} {t.people}
                      </p>
                    </div>

                    <Badge
                      status={
                        isMaintenance
                          ? "maintenance"
                          : isInUse
                            ? "inUse"
                            : "free"
                      }
                      size="sm"
                    />
                  </div>

                  {isInUse && activeBooking && (
                    <div className="mt-2 rounded-xl bg-white/80 dark:bg-slate-900/80 p-2 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                      <p className="truncate">
                        ⏳ {activeBooking.startTime}–{activeBooking.endTime} :{" "}
                        {activeBooking.purpose}
                      </p>
                    </div>
                  )}

                  {!isInUse && !isMaintenance && (
                    <button
                      onClick={() => onOpenBookingModal(room.id)}
                      className="mt-2.5 w-full rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 py-1.5 text-[11px] font-bold transition-colors"
                    >
                      + {t.quickBook}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
export default DashboardView
