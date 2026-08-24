import React, { useState } from "react"
import {
  DoorOpen,
  MapPin,
  Users,
  Calendar,
  Wrench,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react"
import { Room } from "../types"
import { useApp } from "../context/AppContext"
import { Badge } from "../components/common/Badge"

interface RoomsViewProps {
  onOpenRoomModal: (room?: Room) => void
  onOpenBookingModal: (roomId?: string) => void
  onOpenConfirmModal: (config: {
    title: string
    message: string
    onConfirm: () => void
  }) => void
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  onOpenRoomModal,
  onOpenBookingModal,
  onOpenConfirmModal,
}) => {
  const { t, rooms, bookings, currentUser, handleDeleteRoom } = useApp()
  const isAdmin = currentUser?.role === "admin"
  const todayStr = new Date().toISOString().split("T")[0]

  const [filter, setFilter] = useState<"all" | "available" | "maintenance">(
    "all",
  )

  const filteredRooms = rooms.filter((r) => {
    if (filter === "all") return true
    return r.status === filter
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {t.all} ({rooms.length})
          </button>
          <button
            onClick={() => setFilter("available")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              filter === "available"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {t.available} (
            {rooms.filter((r) => r.status === "available").length})
          </button>
          <button
            onClick={() => setFilter("maintenance")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              filter === "maintenance"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {t.maintenance} (
            {rooms.filter((r) => r.status === "maintenance").length})
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => onOpenRoomModal()}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addRoom}</span>
          </button>
        )}
      </div>

      {/* Rooms Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const todayCount = bookings.filter(
            (b) =>
              b.roomId === room.id &&
              b.date === todayStr &&
              b.status === "approved",
          ).length

          const isAvailable = room.status === "available"

          return (
            <div
              key={room.id}
              className="group flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`h-2.5 w-full bg-gradient-to-r ${
                  isAvailable
                    ? "from-blue-600 via-cyan-500 to-emerald-500"
                    : "from-amber-500 to-rose-500"
                }`}
              />

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                {/* Header & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {room.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-none" />
                        <span className="truncate">{room.location}</span>
                      </p>
                    </div>
                    <Badge status={room.status} />
                  </div>

                  {/* Room Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold border border-slate-100 dark:border-slate-800">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>
                        {room.capacity} {t.people}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold border border-slate-100 dark:border-slate-800">
                      <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        วันนี้ {todayCount} {t.items}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Badges */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {t.availableEquipment}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {room.equipment.map((eq, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isAvailable ? (
                    <button
                      onClick={() => onOpenBookingModal(room.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t.quickBook}</span>
                    </button>
                  ) : (
                    <span className="flex-1 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 py-2">
                      ⚠️ อยู่ระหว่างปิดซ่อมบำรุง
                    </span>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenRoomModal(room)}
                        title={t.edit}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          onOpenConfirmModal({
                            title: t.delete,
                            message: t.confirmDeleteRoom,
                            onConfirm: () => handleDeleteRoom(room.id),
                          })
                        }
                        title={t.delete}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default RoomsView
