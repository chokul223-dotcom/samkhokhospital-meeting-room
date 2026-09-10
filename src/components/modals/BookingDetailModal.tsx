import React, { useState, useEffect } from "react"
import {
  X,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  Video,
  Phone,
  Link2,
  Plus,
  Trash2,
  Pencil,
  Save,
  XCircle,
  Crown,
  Building2,
  Tag,
} from "lucide-react"
import { Booking, Room } from "../../types"
import { useApp } from "../../context/AppContext"
import { Badge } from "../common/Badge"
import { getRoomColor } from "../../constants/roomColors"
import {
  formatRoomName,
  formatRoomLocation,
  formatUserName,
  formatDepartment,
} from "../../constants/translations"

interface BookingDetailModalProps {
  booking: Booking | null
  onClose: () => void
}

// --- Sub-component: Info Row
const InfoRow: React.FC<{
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  accent?: string
}> = ({ icon, label, value, accent = "text-blue-500" }) => (
  <div className="flex items-start gap-2.5">
    <span className={`mt-0.5 flex-none ${accent}`}>{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{value}</div>
    </div>
  </div>
)

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
}) => {
  const { t, language, rooms, users, currentUser, handleUpdateBooking } = useApp()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit state
  const [editPurpose, setEditPurpose] = useState("")
  const [editChairman, setEditChairman] = useState("")
  const [editAttendees, setEditAttendees] = useState(0)
  const [editOnlineMeeting, setEditOnlineMeeting] = useState("")
  const [editContactPerson, setEditContactPerson] = useState("")
  const [editLinks, setEditLinks] = useState<{ title: string; url: string }[]>([])
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")

  useEffect(() => {
    if (booking) {
      setEditPurpose(booking.purpose || "")
      setEditChairman(booking.chairman || "")
      setEditAttendees(booking.attendees || 0)
      setEditOnlineMeeting(booking.onlineMeeting || "ไม่ใช้ระบบออนไลน์")
      setEditContactPerson(booking.contactPerson || "")
      setEditLinks(booking.relatedLinks || [])
    }
  }, [booking])

  if (!booking) return null

  const isAdmin = currentUser?.role === "admin"
  const room = rooms.find((r) => r.id === booking.roomId)
  const user = users.find((u) => u.id === booking.userId)
  const roomColor = getRoomColor(booking.roomId)

  const formatDisplayDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditPurpose(booking.purpose || "")
    setEditChairman(booking.chairman || "")
    setEditAttendees(booking.attendees || 0)
    setEditOnlineMeeting(booking.onlineMeeting || "ไม่ใช้ระบบออนไลน์")
    setEditContactPerson(booking.contactPerson || "")
    setEditLinks(booking.relatedLinks || [])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await handleUpdateBooking(booking.id, {
        purpose: editPurpose.trim(),
        chairman: editChairman.trim(),
        attendees: editAttendees,
        onlineMeeting: editOnlineMeeting.trim(),
        contactPerson: editContactPerson.trim(),
        relatedLinks: editLinks,
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return
    setEditLinks((prev) => [
      ...prev,
      { title: newLinkTitle.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() },
    ])
    setNewLinkTitle("")
    setNewLinkUrl("")
  }

  const handleRemoveLink = (idx: number) => {
    setEditLinks((prev) => prev.filter((_, i) => i !== idx))
  }

  const inputClass =
    "w-full rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"

  const displayLinks = isEditing ? editLinks : (booking.relatedLinks || [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex-none">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${roomColor.dotClass} shadow-sm`} />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === "th" ? "รายละเอียดการจองห้องประชุม" : "Booking Detail"}
                {booking.status === "approved" && (
                  <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                    ✓ {language === "th" ? "อนุมัติ" : "Approved"}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatRoomName(room, language)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                {language === "th" ? "แก้ไขข้อมูล" : "Edit"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Room Image ── */}
        <div className="h-36 sm:h-48 w-full flex-none overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
          {room?.imageUrl ? (
            <img
              src={room.imageUrl}
              alt={formatRoomName(room, language) || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800`}>
              <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700" />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Room Info Strip */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="font-bold">{formatRoomName(room, language)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>{formatRoomLocation(room?.location, language)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span>{language === "th" ? "ความจุ" : "Capacity"} {room?.capacity || "-"} {t.people}</span>
            </div>
            {room?.equipment && room.equipment.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {room.equipment.slice(0, 3).map((eq, i) => (
                  <span key={i} className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    {eq}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-4">

              {/* Meeting Topic */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "th" ? "หัวข้อ / วัตถุประสงค์" : "Purpose / Topic"}
                </p>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{booking.purpose}</p>
                )}
                <Badge status={booking.status} />
              </div>

              {/* Chairman */}
              <InfoRow
                icon={<Crown className="h-4 w-4" />}
                label={language === "th" ? "ประธาน" : "Chairman"}
                accent="text-amber-500"
                value={
                  isEditing ? (
                    <input
                      type="text"
                      value={editChairman}
                      onChange={(e) => setEditChairman(e.target.value)}
                      placeholder={language === "th" ? "ชื่อ-นามสกุล หรือตำแหน่ง" : "Name or position"}
                      className={inputClass}
                    />
                  ) : (
                    <span>{booking.chairman || <span className="text-slate-400 font-normal italic text-xs">{language === "th" ? "ไม่ระบุ" : "—"}</span>}</span>
                  )
                }
              />

              {/* Attendees */}
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label={t.attendees}
                accent="text-purple-500"
                value={
                  isEditing ? (
                    <input
                      type="number"
                      min={1}
                      max={room?.capacity || 200}
                      value={editAttendees}
                      onChange={(e) => setEditAttendees(Number(e.target.value))}
                      className={inputClass}
                    />
                  ) : (
                    <span>{booking.attendees} {t.people}</span>
                  )
                }
              />

              {/* Date & Time */}
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label={t.timeSlot}
                accent="text-indigo-500"
                value={
                  <span>
                    <span className="block">{booking.startTime} – {booking.endTime} น.</span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{formatDisplayDate(booking.date)}</span>
                  </span>
                }
              />

              {/* Online Meeting */}
              <InfoRow
                icon={<Video className="h-4 w-4" />}
                label={language === "th" ? "ระบบออนไลน์" : "Online Meeting"}
                accent="text-cyan-500"
                value={
                  isEditing ? (
                    <select
                      value={editOnlineMeeting}
                      onChange={(e) => setEditOnlineMeeting(e.target.value)}
                      className={inputClass}
                    >
                      <option value="ไม่ใช้ระบบออนไลน์">{language === "th" ? "ไม่ใช้ระบบออนไลน์" : "None"}</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="WebEx">WebEx</option>
                      <option value="MS Teams">MS Teams</option>
                      <option value="อื่นๆ (โปรดระบุในรายละเอียด)">{language === "th" ? "อื่นๆ" : "Other"}</option>
                    </select>
                  ) : (
                    <span>{booking.onlineMeeting || <span className="text-slate-400 font-normal italic text-xs">{language === "th" ? "ไม่ใช้ระบบออนไลน์" : "None"}</span>}</span>
                  )
                }
              />
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-4">

              {/* Requester / Department */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "th" ? "หน่วยงานที่จอง" : "Booked By"}
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-none">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatUserName(user, language) || t.staff}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatDepartment(user?.department, user?.role, language)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label={language === "th" ? "ประสานงานผ่าน" : "Contact Person"}
                accent="text-emerald-500"
                value={
                  isEditing ? (
                    <input
                      type="text"
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      placeholder={language === "th" ? "ชื่อ / เบอร์ติดต่อ" : "Name / Phone"}
                      className={inputClass}
                    />
                  ) : (
                    <span>{booking.contactPerson || <span className="text-slate-400 font-normal italic text-xs">{language === "th" ? "ไม่ระบุ" : "—"}</span>}</span>
                  )
                }
              />

              {/* Related Links */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  {language === "th" ? "ลิงก์ที่เกี่ยวข้อง" : "Related Links"}
                </p>

                {displayLinks.length > 0 ? (
                  <ul className="space-y-1.5">
                    {displayLinks.map((link, idx) => (
                      <li key={idx} className="flex items-center gap-2 group">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1.5"
                        >
                          <span>🔗</span>
                          <span>{link.title || link.url}</span>
                        </a>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveLink(idx)}
                            className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {language === "th" ? "ยังไม่มีลิงก์" : "No links yet"}
                  </p>
                )}

                {/* Add Link (Admin Edit Mode) */}
                {isEditing && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                    <input
                      type="text"
                      placeholder={language === "th" ? "ชื่อลิงก์ (เช่น เอกสารวาระ)" : "Link title"}
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className={inputClass}
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className={`${inputClass} flex-1`}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink() } }}
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        disabled={!newLinkUrl.trim()}
                        className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40 cursor-pointer flex-none"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking created info */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">
                {language === "th" ? "จองเมื่อ" : "Booked on"} {booking.createdAt}
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          {booking.status === "rejected" && booking.rejectReason && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="h-4 w-4" />
                <span>{t.rejectedReasonLabel}</span>
              </div>
              <p>{booking.rejectReason}</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-3 flex-none">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                {language === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? (language === "th" ? "กำลังบันทึก..." : "Saving...") : (language === "th" ? "บันทึกการเปลี่ยนแปลง" : "Save Changes")}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingDetailModal
