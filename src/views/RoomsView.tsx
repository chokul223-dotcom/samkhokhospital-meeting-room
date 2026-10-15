import React, { useState } from "react"
import {
  Calendar,
  Building2,
  Search,
  ShoppingBag,
  Info,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react"
import { Room } from "../types"
import { useApp } from "../context/AppContext"
import { RoomDetailModal } from "../components/modals/RoomDetailModal"
import { getRoomColor, getRoomImage } from "../constants/roomColors"
import {
  formatRoomName,
  formatRoomLocation,
  formatEquipment,
} from "../constants/translations"

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
  const { t, language, rooms, currentUser, handleDeleteRoom } = useApp()
  const isAdmin = currentUser?.role === "admin"

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [detailRoom, setDetailRoom] = useState<Room | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const name = formatRoomName(r, language).toLowerCase()
    const loc = formatRoomLocation(r.location, language).toLowerCase()
    return name.includes(q) || loc.includes(q)
  })

  const displayedRooms = filteredRooms.slice(0, entriesPerPage)

  const handleBookClick = (roomId: string) => {
    onOpenBookingModal(roomId)
  }

  // Room custom description helper
  const getRoomDescription = (room: Room) => {
    if (language === "th") {
      if (room.id === "r1") {
        return "ห้องประชุมขนาดใหญ่ รองรับการประชุม สัมมนา และระบบเสียงครบครัน"
      }
      if (room.id === "r2") {
        return "ห้องประชุมขนาดเล็ก พร้อมอุปกรณ์นำเสนอและไวท์บอร์ด"
      }
      return room.status === "available"
        ? "ห้องประชุมพร้อมสิ่งอำนวยความสะดวกครบครัน"
        : "ห้องอยู่ระหว่างปิดปรับปรุง/ซ่อมบำรุง"
    } else {
      if (room.id === "r1") {
        return "Large conference room equipped for meetings, seminars, and full audio-visual systems"
      }
      if (room.id === "r2") {
        return "Small meeting room with presentation equipment and whiteboard"
      }
      return room.status === "available"
        ? "Fully equipped meeting room"
        : "Currently under maintenance"
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ─── 1. Breadcrumb ─── */}
      <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <span className="text-slate-800 dark:text-slate-200">
          {t.roomBreadcrumb || "ห้องประชุม / รายการ"}
        </span>
      </div>

      {/* ─── 2. Heading Title ─── */}
      <div className="flex items-center gap-2.5 pt-1">
        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {t.roomCatalogTitle || "รายการ ห้องประชุม"}
        </h2>
      </div>

      {/* ─── 3. Entries Selector & Search Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>{t.showEntries || "แสดง"}</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer shadow-xs"
          >
            <option value={10} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              10 รายการ
            </option>
            <option value={20} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              20 รายการ
            </option>
            <option value={30} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              30 รายการ
            </option>
            <option value={50} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              50 รายการ
            </option>
          </select>

          <button className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all">
            Go
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={
                language === "th"
                  ? "ค้นหาห้องประชุม..."
                  : "Search rooms..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          </div>

          {/* Admin Add Room */}
          {isAdmin && (
            <button
              onClick={() => onOpenRoomModal()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addRoom}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 4. Summary Info Bar ─── */}
      <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
        {language === "th"
          ? `ทั้งหมด ${filteredRooms.length} รายการ, แสดง 1 ถึง ${Math.min(entriesPerPage, filteredRooms.length)}, หน้าที่ 1 จากทั้งหมด 1 หน้า`
          : `Total ${filteredRooms.length} items, showing 1 to ${Math.min(entriesPerPage, filteredRooms.length)}, page 1 of 1`}
      </div>

      {/* ─── 5. Room List Table ─── */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Column Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 px-5 py-2.5 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
          {language === "th" ? "รายละเอียด" : "Details"}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayedRooms.map((room, idx) => {
            const isAvailable = room.status === "available"

            return (
              <div
                key={room.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Photo */}
                  <div className="w-28 h-20 sm:w-32 sm:h-20 flex-none rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <img
                      src={room.imageUrl || getRoomImage(room.id, idx)}
                      alt={formatRoomName(room, language)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png"
                        e.currentTarget.className =
                          "w-full h-full object-contain p-2 bg-slate-100 dark:bg-slate-800"
                      }}
                    />
                  </div>

                  {/* Badges & Description */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                          idx === 0
                            ? "bg-pink-500 dark:bg-pink-600 text-white"
                            : "bg-purple-600 dark:bg-purple-600 text-white"
                        } shadow-xs`}
                      >
                        {formatRoomName(room, language)} [{room.id.toUpperCase()}]
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                      {getRoomDescription(room)}
                    </p>

                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                      {formatRoomLocation(room.location, language)} •{" "}
                      {room.capacity} {t.people || "ที่นั่ง"}
                    </p>
                  </div>
                </div>

                {/* Right: Blue 'จองห้องประชุม' & Orange 'รายละเอียด' Buttons */}
                <div className="flex items-center gap-2 flex-none self-end md:self-center">
                  {/* Blue Book Button */}
                  <button
                    onClick={() => handleBookClick(room.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer ${
                      isAvailable
                        ? "bg-[#0070e0] hover:bg-[#005fb8] text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    }`}
                    disabled={!isAvailable}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{t.bookRoomsNav || "จองห้องประชุม"}</span>
                  </button>

                  {/* Orange Detail Button */}
                  <button
                    onClick={() => setDetailRoom(room)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#f26522] hover:bg-[#d9531e] text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>{t.roomDetails || "รายละเอียด"}</span>
                  </button>

                  {/* Admin Edit/Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => onOpenRoomModal(room)}
                        title={t.edit}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors cursor-pointer"
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 6. Room Detail Modal (Photo + Table) ─── */}
      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          onClose={() => setDetailRoom(null)}
          onOpenBookingModal={(roomId) => handleBookClick(roomId)}
        />
      )}
    </div>
  )
}
export default RoomsView
