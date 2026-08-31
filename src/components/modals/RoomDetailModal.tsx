import React from "react"
import { X, Calendar } from "lucide-react"
import { Room } from "../../types"
import { useApp } from "../../context/AppContext"
import { getRoomColor, getRoomImage } from "../../constants/roomColors"
import {
  formatRoomName,
  formatRoomLocation,
  formatEquipment,
} from "../../constants/translations"

interface RoomDetailModalProps {
  room: Room | null
  onClose: () => void
  onOpenBookingModal?: (roomId: string) => void
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onOpenBookingModal,
}) => {
  const { t, language, rooms } = useApp()

  if (!room) return null

  const roomIdx = rooms.findIndex((r) => r.id === room.id)
  const roomColor = getRoomColor(room.id, roomIdx >= 0 ? roomIdx : 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header (Purple bar) ─── */}
        <div className="flex items-center justify-between px-5 py-3 bg-purple-700 dark:bg-purple-800 text-white">
          <h3 className="text-sm font-bold flex items-center gap-2">
            📋 {language === "th" ? "รายละเอียดของ ห้องประชุม" : "Meeting Room Details"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-purple-600 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ─── Room Photo ─── */}
        <div className="w-full aspect-[16/9] bg-slate-200 dark:bg-slate-800">
          <img
            src={room.imageUrl || getRoomImage(room.id, roomIdx)}
            alt={formatRoomName(room, language)}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png"
              e.currentTarget.className =
                "w-full h-full object-contain p-6 bg-slate-100 dark:bg-slate-800"
            }}
          />
        </div>

        {/* ─── Info Table ─── */}
        <div className="mx-4 my-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {/* Room Name */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 w-36 whitespace-nowrap">
                  {language === "th" ? "ชื่อห้องประชุม" : "Room Name"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${roomColor.bgClass} ${roomColor.textClass} shadow-xs`}
                  >
                    {formatRoomName(room, language)}
                  </span>
                </td>
              </tr>

              {/* Description */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                  {language === "th" ? "รายละเอียด" : "Description"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {language === "th"
                    ? `${room.status === "available" ? "ห้องประชุมขนาดใหญ่" : "ห้องอยู่ระหว่างซ่อมบำรุง"}`
                    : `${room.status === "available" ? "Large meeting room" : "Under maintenance"}`}
                </td>
              </tr>

              {/* Location / Building */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                  {language === "th" ? "อาคาร/สถานที่" : "Building/Location"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {formatRoomLocation(room.location, language)}
                </td>
              </tr>

              {/* Room Code */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                  {language === "th" ? "หมายเลขห้องประชุม" : "Room Code"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">
                  {room.id.toUpperCase()}
                </td>
              </tr>

              {/* Capacity / Seats */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                  {language === "th" ? "จำนวนที่นั่ง" : "Capacity"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {room.capacity} {language === "th" ? "ที่นั่ง" : "seats"}
                </td>
              </tr>

              {/* Equipment */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap align-top">
                  {language === "th" ? "อุปกรณ์" : "Equipment"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium"
                      >
                        {formatEquipment(eq, language)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Status */}
              <tr>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 whitespace-nowrap">
                  {language === "th" ? "สถานะ" : "Status"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      room.status === "available"
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {room.status === "available"
                      ? language === "th"
                        ? "ว่าง"
                        : "Available"
                      : language === "th"
                        ? "ซ่อมบำรุง"
                        : "Maintenance"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ─── Modal Footer ─── */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-2">
          {room.status === "available" && onOpenBookingModal && (
            <button
              onClick={() => {
                onClose()
                onOpenBookingModal(room.id)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{language === "th" ? "จองห้องประชุม" : "Book Room"}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}
