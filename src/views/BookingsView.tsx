import React, { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  Check,
  X,
  Trash2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { Badge } from "../components/common/Badge"
import { BookingDetailModal } from "../components/modals/BookingDetailModal"
import { BookingStatus, Booking } from "../types"
import {
  formatRoomName,
  formatUserName,
  formatDepartment,
} from "../constants/translations"

interface BookingsViewProps {
  initialStatusFilter?: string
  onOpenBookingModal: () => void
  onOpenRejectModal: (bookingId: string) => void
  onOpenConfirmModal: (config: {
    title: string
    message: string
    onConfirm: () => void
  }) => void
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  initialStatusFilter = "all",
  onOpenBookingModal,
  onOpenRejectModal,
  onOpenConfirmModal,
}) => {
  const {
    t,
    bookings,
    rooms,
    users,
    currentUser,
    handleApprove,
    handleCancel,
    handleClearAllBookings,
    language,
  } = useApp()

  const isAdmin = currentUser?.role === "admin"
  const todayStr = new Date().toISOString().split("T")[0]

  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter)
  const [dateFilter, setDateFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const myBookings = useMemo(() => {
    return isAdmin
      ? bookings
      : bookings.filter((b) => b.userId === currentUser?.id)
  }, [bookings, isAdmin, currentUser])

  const filteredBookings = useMemo(() => {
    return myBookings.filter((b) => {
      // Status filter
      if (statusFilter === "today") {
        if (b.date !== todayStr) return false
      } else if (statusFilter !== "all" && b.status !== statusFilter) {
        return false
      }

      // Date filter
      if (dateFilter && b.date !== dateFilter) {
        return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const room = rooms.find((r) => r.id === b.roomId)
        const user = users.find((u) => u.id === b.userId)
        const matchPurpose = b.purpose.toLowerCase().includes(query)
        const matchRoom = room?.name.toLowerCase().includes(query)
        const matchUser = user?.name.toLowerCase().includes(query)
        const matchDept = user?.department.toLowerCase().includes(query)

        if (!matchPurpose && !matchRoom && !matchUser && !matchDept) {
          return false
        }
      }

      return true
    })
  }, [
    myBookings,
    statusFilter,
    dateFilter,
    searchQuery,
    todayStr,
    rooms,
    users,
  ])

  const statusOptions = [
    { value: "all", label: t.all },
    { value: "today", label: t.todayBookings },
    { value: "pending", label: t.pending },
    { value: "approved", label: t.approved },
    { value: "rejected", label: t.rejected },
    { value: "cancelled", label: t.cancelled },
  ]

  const formatDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Search & Filter Toolbar */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          {/* Search & Date Filter Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchBookings}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
              <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
            </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {(dateFilter || searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setDateFilter("")
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
                className="flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                title={t.clearFilter}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.clearFilter}</span>
              </button>
            )}

            {isAdmin && bookings.length > 0 && (
              <button
                onClick={() =>
                  onOpenConfirmModal({
                    title: t.deleteAllBookings,
                    message: t.confirmDeleteAllBookings,
                    onConfirm: handleClearAllBookings,
                  })
                }
                className="flex items-center gap-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 px-3.5 py-2 text-xs font-bold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.deleteAllBookings}</span>
              </button>
            )}
          </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {statusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`flex-none rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
            <div className="ml-auto text-xs font-semibold text-slate-400 pl-2">
              {filteredBookings.length} {t.items}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Filter className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">{t.noBookingsFound}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredBookings.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId)
                const user = users.find((u) => u.id === b.userId)
                const isOwn = b.userId === currentUser?.id

                return (
                  <div
                    key={b.id}
                    className="p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer"
                    onClick={() => setSelectedBooking(b)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info Details */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {b.purpose}
                          </h4>
                          <Badge status={b.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            {formatDate(b.date)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            {b.startTime} – {b.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <DoorOpen className="h-3.5 w-3.5" />
                            {formatRoomName(room, language) || t.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {b.attendees} {t.people}
                          </span>
                          {isAdmin && (
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300">
                              {t.createdBy}: {formatUserName(user, language)} ({formatDepartment(user?.department, user?.role, language)})
                            </span>
                          )}
                        </div>

                        {/* Rejection Reason Notice */}
                        {b.status === "rejected" && b.rejectReason && (
                          <div className="mt-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 flex-none mt-0.5" />
                            <div>
                              <span className="font-bold">
                                {t.rejectedReasonLabel}
                              </span>{" "}
                              <span>{b.rejectReason}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 flex-none pt-2 md:pt-0">
                        {isAdmin && b.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(b.id) }}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>{t.approve}</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onOpenRejectModal(b.id) }}
                              className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-900/60 px-3.5 py-2 text-xs font-bold transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>{t.reject}</span>
                            </button>
                          </>
                        )}

                        {isOwn &&
                          (b.status === "pending" || b.status === "approved") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpenConfirmModal({
                                  title: t.cancel,
                                  message: t.confirmCancelBooking,
                                  onConfirm: () => handleCancel(b.id),
                                })
                              }}
                              className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>{t.cancel}</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  ) 
}
export default BookingsView
