import React, { useState, useEffect } from "react"
import {
  X,
  Clock,
  MapPin,
  Users,
  User,
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
  MonitorPlay,
  Mic,
  Projector,
  Presentation,
  Wifi,
  Building2,
} from "lucide-react"
import { Booking, Room } from "../../types"
import { useApp } from "../../context/AppContext"
import { Badge } from "../common/Badge"
import { getRoomColor, getRoomImage } from "../../constants/roomColors"
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

// Map equipment name → icon
const EquipmentIcon: React.FC<{ name: string }> = ({ name }) => {
  const n = name.toLowerCase()
  if (n.includes("โปรเจค") || n.includes("projector")) return <Projector className="h-3.5 w-3.5" />
  if (n.includes("จอ") || n.includes("screen") || n.includes("monitor")) return <MonitorPlay className="h-3.5 w-3.5" />
  if (n.includes("ไมค์") || n.includes("ไมโคร") || n.includes("micro")) return <Mic className="h-3.5 w-3.5" />
  if (n.includes("วิดีโอ") || n.includes("video") || n.includes("conference") || n.includes("ทางไกล")) return <MonitorPlay className="h-3.5 w-3.5" />
  if (n.includes("wifi") || n.includes("internet") || n.includes("อินเตอร์")) return <Wifi className="h-3.5 w-3.5" />
  if (n.includes("กระดาน") || n.includes("whiteboard") || n.includes("บอร์ด")) return <Presentation className="h-3.5 w-3.5" />
  return <Building2 className="h-3.5 w-3.5" />
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
}) => {
  const { t, language, rooms, users, currentUser, handleUpdateBooking } = useApp()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      setEditOnlineMeeting(booking.onlineMeeting && booking.onlineMeeting !== '' ? booking.onlineMeeting : 'none')
      setEditContactPerson(booking.contactPerson || "")
      setEditLinks(booking.relatedLinks || [])
    }
  }, [booking])

  if (!booking) return null

  const isAdmin = currentUser?.role === "admin"
  const room = rooms.find((r) => r.id === booking.roomId)
  const user = users.find((u) => u.id === booking.userId)
  const roomColor = getRoomColor(booking.roomId)
  const roomIndex = rooms.findIndex((r) => r.id === booking.roomId)
  const roomImgSrc = room?.imageUrl || getRoomImage(booking.roomId, roomIndex)

  const formatDisplayDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleStartEdit = () => setIsEditing(true)

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
        onlineMeeting: editOnlineMeeting === 'none' ? '' : editOnlineMeeting.trim(),
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
    "w-full rounded-lg bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 px-2.5 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"

  const displayLinks = isEditing ? editLinks : (booking.relatedLinks || [])

  const LabelValue: React.FC<{ label: string; value: React.ReactNode; editing?: React.ReactNode }> = ({ label, value, editing }) => (
    <div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5">{label} :</p>
      {isEditing && editing ? editing : (
        <div className="text-sm text-slate-800 dark:text-slate-100">{value}</div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex-none">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${roomColor.dotClass} shadow-sm`} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === "th" ? "จองห้องประชุม" : "Meeting Room Booking"}
              {booking.status === "approved" && (
                <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ({language === "th" ? "อนุมัติ" : "Approved"})
                </span>
              )}
              {booking.status === "pending" && (
                <span className="ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ({language === "th" ? "รออนุมัติ" : "Pending"})
                </span>
              )}
              {booking.status === "rejected" && (
                <span className="ml-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  ({language === "th" ? "ปฏิเสธ" : "Rejected"})
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                {language === "th" ? "แก้ไขข้อมูล" : "Edit"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Main content: Left sidebar + Right panel ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT SIDEBAR ── */}
          <div className="w-52 flex-none border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col overflow-y-auto">

            {/* Room photo */}
            <div className="w-full h-36 flex-none overflow-hidden bg-slate-200 dark:bg-slate-700">
              <img
                src={roomImgSrc}
                alt={formatRoomName(room, language) || ""}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none" }}
              />
            </div>

            {/* Room info */}
            <div className="p-3 space-y-1.5 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                {formatRoomName(room, language)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === "th" ? "ความจุ" : "Capacity"}: {room?.capacity || "-"} {t.people}
              </p>
              <div className="flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3 w-3 mt-0.5 flex-none text-rose-400" />
                <span>{formatRoomLocation(room?.location, language)}</span>
              </div>
            </div>

            {/* Equipment */}
            {room?.equipment && room.equipment.length > 0 && (
              <div className="p-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "th" ? "สิ่งอำนวยความสะดวก" : "Equipment"}
                </p>
                <ul className="space-y-1">
                  {room.equipment.map((eq, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-none">
                        <EquipmentIcon name={eq} />
                      </span>
                      <span className="flex-1">{eq}</span>
                      <span className="text-slate-400 text-[11px]">1 หน่วย</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">

              {/* Meeting title (centered, prominent) */}
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
                    className={inputClass + " text-center"}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {booking.purpose}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatDisplayDate(booking.date)} เวลา {booking.startTime} - {booking.endTime} น.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ณ {formatRoomName(room, language)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatRoomLocation(room?.location, language)}
                </p>
                <div className="mt-1.5 flex justify-center">
                  <Badge status={booking.status} />
                </div>
              </div>

              {/* 2-column details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                {/* LEFT col */}
                <div className="space-y-3">
                  {/* Chairman */}
                  <LabelValue
                    label={language === "th" ? "ประธาน" : "Chairman"}
                    value={<span className="font-semibold">{booking.chairman || <span className="text-slate-400 italic text-xs">{language === "th" ? "ไม่ระบุ" : "—"}</span>}</span>}
                    editing={
                      <input type="text" value={editChairman} onChange={(e) => setEditChairman(e.target.value)}
                        placeholder={language === "th" ? "ชื่อ-นามสกุล หรือตำแหน่ง" : "Name or position"}
                        className={inputClass} />
                    }
                  />

                  {/* Attendees */}
                  <LabelValue
                    label={language === "th" ? "จำนวนผู้เข้าร่วม" : "Attendees"}
                    value={<span className="font-semibold">{booking.attendees} {t.people}</span>}
                    editing={
                      <input type="number" min={1} max={room?.capacity || 200} value={editAttendees}
                        onChange={(e) => setEditAttendees(Number(e.target.value))}
                        className={inputClass} />
                    }
                  />

                  {/* Online meeting */}
                  <LabelValue
                    label={language === "th" ? "ระบบออนไลน์ที่ต้องการใช้" : "Online Meeting"}
                    value={
                      <ul className="mt-0.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                        <li>{
                          !booking.onlineMeeting || booking.onlineMeeting === "ไม่ใช้ระบบออนไลน์"
                            ? (language === "th" ? "ไม่ใช้ระบบออนไลน์" : "None")
                            : booking.onlineMeeting
                        }</li>
                      </ul>
                    }
                    editing={
                      <select value={editOnlineMeeting} onChange={(e) => setEditOnlineMeeting(e.target.value)} className={inputClass}>
                        <option value="none">{language === "th" ? "ไม่ใช้ระบบออนไลน์" : "None"}</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="WebEx">WebEx</option>
                        <option value="MS Teams">MS Teams</option>
                        <option value="อื่นๆ (โปรดระบุในรายละเอียด)">{language === "th" ? "อื่นๆ" : "Other"}</option>
                      </select>
                    }
                  />

                  {/* Related links */}
                  <div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      {language === "th" ? "ลิงก์ที่เกี่ยวข้อง" : "Related Links"} :
                    </p>
                    {displayLinks.length > 0 ? (
                      <ul className="space-y-1 mt-1">
                        {displayLinks.map((link, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <a href={link.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate">
                              <span>⭐</span>
                              <span>{link.title || link.url}</span>
                            </a>
                            {isEditing && (
                              <button onClick={() => handleRemoveLink(idx)}
                                className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer flex-none">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">{language === "th" ? "ยังไม่มีลิงก์" : "No links"}</p>
                    )}
                    {isEditing && (
                      <div className="mt-1.5 space-y-1">
                        <input type="text" placeholder={language === "th" ? "ชื่อลิงก์" : "Link title"}
                          value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className={inputClass} />
                        <div className="flex gap-1">
                          <input type="url" placeholder="https://..." value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink() } }}
                            className={`${inputClass} flex-1`} />
                          <button type="button" onClick={handleAddLink} disabled={!newLinkUrl.trim()}
                            className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer flex-none">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT col */}
                <div className="space-y-3">
                  {/* Department */}
                  <LabelValue
                    label={language === "th" ? "หน่วยงานที่จอง" : "Department"}
                    value={
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-none">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                            {formatUserName(user, language) || t.staff}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatDepartment(user?.department, user?.role, language)}
                          </p>
                        </div>
                      </div>
                    }
                  />

                  {/* Contact */}
                  <LabelValue
                    label={language === "th" ? "ประสานงานผ่าน" : "Contact Person"}
                    value={
                      <span className="font-semibold">{booking.contactPerson ||
                        <span className="text-slate-400 italic text-xs">{language === "th" ? "ไม่ระบุ" : "—"}</span>
                      }</span>
                    }
                    editing={
                      <input type="text" value={editContactPerson}
                        onChange={(e) => setEditContactPerson(e.target.value)}
                        placeholder={language === "th" ? "ชื่อ / เบอร์ติดต่อ" : "Name / Phone"}
                        className={inputClass} />
                    }
                  />

                  {/* Time slot */}
                  <LabelValue
                    label={language === "th" ? "ช่วงเวลา" : "Time Slot"}
                    value={
                      <span className="font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        {booking.startTime} – {booking.endTime} น.
                      </span>
                    }
                  />

                  {/* Booked at */}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    {language === "th" ? "จองเมื่อ" : "Booked on"} {booking.createdAt}
                  </p>
                </div>
              </div>

              {/* Rejection Reason */}
              {booking.status === "rejected" && booking.rejectReason && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t.rejectedReasonLabel}</span>
                  </div>
                  <p>{booking.rejectReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-2 flex-none">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                {language === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? (language === "th" ? "กำลังบันทึก..." : "Saving...") : (language === "th" ? "บันทึกการเปลี่ยนแปลง" : "Save Changes")}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
