import React, { useState } from "react"
import { X, DoorOpen, Users, MapPin, Wrench, AlertCircle } from "lucide-react"
import { Room } from "../../types"
import { useApp } from "../../context/AppContext"

interface RoomModalProps {
  room?: Room
  onClose: () => void
}

export const RoomModal: React.FC<RoomModalProps> = ({ room, onClose }) => {
  const { t, handleSaveRoom } = useApp()

  const [name, setName] = useState(room?.name || "")
  const [capacity, setCapacity] = useState(room?.capacity || 20)
  const [location, setLocation] = useState(room?.location || "")
  const [equipment, setEquipment] = useState(room?.equipment.join(", ") || "")
  const [status, setStatus] = useState<Room["status"]>(
    room?.status || "available",
  )
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError(t.errRoomName)
      return
    }
    if (!location.trim()) {
      setError(t.errLocation)
      return
    }
    if (capacity < 1) {
      setError(t.errCapacityZero)
      return
    }

    setIsSubmitting(true)
    try {
      await handleSaveRoom({
        id: room?.id || "r" + Date.now(),
        name: name.trim(),
        capacity,
        location: location.trim(),
        equipment: equipment
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        status,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกห้องประชุม")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {room ? t.editRoom : t.addRoom}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                จัดการข้อมูลห้องประชุมและอุปกรณ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.roomName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ห้องประชุมใหญ่ (Grand Hall)"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.location} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น อาคาร A ชั้น 2"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <MapPin className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.capacity} ({t.people}){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Users className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.equipmentList}
            </label>
            <textarea
              rows={2}
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder={t.equipmentExample}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.roomStatusLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("available")}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold border transition-all ${
                  status === "available"
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>{t.available}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("maintenance")}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold border transition-all ${
                  status === "maintenance"
                    ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>{t.maintenance}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default RoomModal
