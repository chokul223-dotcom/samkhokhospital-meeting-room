import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  X,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  Save,
  XCircle,
  MonitorPlay,
  Mic,
  Projector,
  Presentation,
  Wifi,
  Building2,
  Paperclip,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Eye,
  Download,
  Lock,
  Upload,
  LoaderCircle,
  LogIn,
} from "lucide-react"
import { Booking, BookingAttachment, BookingAttachmentUpload } from "../../types"
import { useApp } from "../../context/AppContext"
import { Badge } from "../common/Badge"
import { getRoomColor, getRoomImage } from "../../constants/roomColors"
import {
  formatRoomName,
  formatRoomLocation,
  formatUserName,
  formatDepartment,
} from "../../constants/translations"
import * as api from "../../services/api"
import {
  ACCEPTED_ATTACHMENT_ATTR,
  MAX_ATTACHMENTS,
  formatFileSize,
  getFileCategory,
  isApprovedMember,
  isInlinePreviewable,
  normalizeLinkUrl,
  readFilesAsUploads,
} from "../../utils/attachments"

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

const AttachmentTypeBadge: React.FC<{ mimeType: string; fileName: string }> = ({
  mimeType,
  fileName,
}) => {
  const cat = getFileCategory(mimeType, fileName)
  if (cat === "pdf") {
    return (
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
        <FileText className="h-4 w-4" />
      </span>
    )
  }
  if (cat === "excel") {
    return (
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
        <FileSpreadsheet className="h-4 w-4" />
      </span>
    )
  }
  if (cat === "image") {
    return (
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
        <ImageIcon className="h-4 w-4" />
      </span>
    )
  }
  if (cat === "word") {
    return (
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
        <FileText className="h-4 w-4" />
      </span>
    )
  }
  if (cat === "ppt") {
    return (
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
        <Presentation className="h-4 w-4" />
      </span>
    )
  }
  return (
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
      <Paperclip className="h-4 w-4" />
    </span>
  )
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking: initialBooking,
  onClose,
}) => {
  const { t, language, rooms, bookings, users, currentUser, handleUpdateBooking, showToast } =
    useApp()
  const navigate = useNavigate()
  const isTh = language === "th"

  const booking = bookings.find((b) => b.id === initialBooking?.id) || initialBooking

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editPurpose, setEditPurpose] = useState("")
  const [editChairman, setEditChairman] = useState("")
  const [editAttendees, setEditAttendees] = useState<string>("")
  const [editOnlineMeeting, setEditOnlineMeeting] = useState("")
  const [editContactPerson, setEditContactPerson] = useState("")
  const [editLinks, setEditLinks] = useState<{ title: string; url: string }[]>([])
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newAttachments, setNewAttachments] = useState<BookingAttachmentUpload[]>([])
  const [removeAttachmentIds, setRemoveAttachmentIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File loading & in-app preview state
  const [loadingAttId, setLoadingAttId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<{
    name: string
    mimeType: string
    objectUrl: string
  } | null>(null)

  useEffect(() => {
    if (booking) {
      setEditPurpose(booking.purpose || "")
      setEditChairman(booking.chairman || "")
      setEditAttendees(booking.attendees ? String(booking.attendees) : "")
      setEditOnlineMeeting(
        booking.onlineMeeting && booking.onlineMeeting !== ""
          ? booking.onlineMeeting
          : "none",
      )
      setEditContactPerson(booking.contactPerson || "")
      setEditLinks(booking.relatedLinks || [])
      setNewAttachments([])
      setRemoveAttachmentIds([])
    }
  }, [booking])

  // Clean up blob object URL when closing preview
  useEffect(() => {
    return () => {
      if (previewFile?.objectUrl) {
        URL.revokeObjectURL(previewFile.objectUrl)
      }
    }
  }, [previewFile])

  if (!booking) return null

  const isAdmin = currentUser?.role === "admin"
  const isApprovedUser = isApprovedMember(currentUser)
  const room = rooms.find((r) => r.id === booking.roomId)
  const user =
    users.find((u) => u.id === booking.userId) ||
    (booking.userName
      ? {
          name: booking.userName,
          department: booking.userDepartment || undefined,
          role: booking.userRole || undefined,
        }
      : currentUser?.id === booking.userId
        ? currentUser
        : undefined)
  const roomColor = getRoomColor(booking.roomId)
  const roomIndex = rooms.findIndex((r) => r.id === booking.roomId)
  const roomImgSrc = room?.imageUrl || getRoomImage(booking.roomId, roomIndex)

  const formatDisplayDate = (dStr: string) => {
    const dt = new Date(dStr + "T00:00:00")
    return dt.toLocaleDateString(isTh ? "th-TH" : "en-US", {
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
    setEditAttendees(booking.attendees ? String(booking.attendees) : "")
    setEditOnlineMeeting(
      booking.onlineMeeting && booking.onlineMeeting !== ""
        ? booking.onlineMeeting
        : "none",
    )
    setEditContactPerson(booking.contactPerson || "")
    setEditLinks(booking.relatedLinks || [])
    setNewLinkTitle("")
    setNewLinkUrl("")
    setNewAttachments([])
    setRemoveAttachmentIds([])
  }

  const handleSave = async () => {
    const finalLinks = [...editLinks]
    if (newLinkUrl.trim()) {
      const normalized = normalizeLinkUrl(newLinkUrl)
      if (!normalized) {
        showToast(isTh ? "รูปแบบลิงก์ไม่ถูกต้อง" : "Invalid URL format")
        return
      }
      finalLinks.push({ title: newLinkTitle.trim() || normalized, url: normalized })
    }

    setIsSaving(true)
    try {
      const parsedAttendees = Number(editAttendees)
      if (!editAttendees.trim() || !Number.isFinite(parsedAttendees) || parsedAttendees < 1) {
        showToast(isTh ? "กรุณาระบุจำนวนผู้เข้าร่วมอย่างน้อย 1 คน" : "Please specify at least 1 attendee")
        setIsSaving(false)
        return
      }
      await handleUpdateBooking(booking.id, {
        purpose: editPurpose.trim(),
        chairman: editChairman.trim(),
        attendees: Math.floor(parsedAttendees),
        onlineMeeting:
          editOnlineMeeting === "none" ? "" : editOnlineMeeting.trim(),
        contactPerson: editContactPerson.trim(),
        relatedLinks: finalLinks,
        newAttachments: newAttachments.length > 0 ? newAttachments : undefined,
        removeAttachmentIds:
          removeAttachmentIds.length > 0 ? removeAttachmentIds : undefined,
      })
      setNewLinkTitle("")
      setNewLinkUrl("")
      setNewAttachments([])
      setRemoveAttachmentIds([])
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLink = () => {
    const normalized = normalizeLinkUrl(newLinkUrl)
    if (!normalized) {
      if (newLinkUrl.trim()) {
        showToast(isTh ? "รูปแบบลิงก์ไม่ถูกต้อง กรุณาระบุ https://..." : "Invalid URL format")
      }
      return
    }
    setEditLinks((prev) => [
      ...prev,
      { title: newLinkTitle.trim() || normalized, url: normalized },
    ])
    setNewLinkTitle("")
    setNewLinkUrl("")
  }

  const handleRemoveLink = (idx: number) => {
    setEditLinks((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const existingActiveCount = (booking.attachments || []).filter(
      (a) => !removeAttachmentIds.includes(a.id),
    ).length
    const { uploads, errors } = await readFilesAsUploads(
      files,
      existingActiveCount + newAttachments.length,
      language,
    )
    if (uploads.length > 0) {
      setNewAttachments((prev) => [...prev, ...uploads])
    }
    if (errors.length > 0) {
      showToast(errors[0])
    }
    e.target.value = ""
  }

  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleOpenOrDownloadAttachment = async (
    att: BookingAttachment,
    mode: "view" | "download",
  ) => {
    if (!isApprovedUser) {
      showToast(
        !currentUser
          ? isTh
            ? "กรุณาเข้าสู่ระบบด้วยบัญชีที่ผู้ดูแลระบบอนุมัติแล้วเพื่อเปิดดูหรือดาวน์โหลดเอกสาร"
            : "Please sign in with an admin-approved account to access documents"
          : isTh
            ? "เฉพาะผู้ใช้งานที่ได้รับการอนุมัติจากผู้ดูแลระบบแล้วเท่านั้น จึงจะเปิดดูหรือดาวน์โหลดไฟล์ได้"
            : "Only admin-approved users can view or download documents",
      )
      return
    }

    setLoadingAttId(`${att.id}:${mode}`)
    try {
      let blob: Blob
      let mimeType = att.mimeType || "application/octet-stream"

      if (att.data) {
        // Offline / local fallback blob
        const binary = atob(att.data)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        blob = new Blob([bytes], { type: mimeType })
      } else {
        const res = await api.fetchBookingAttachmentBlob(booking.id, att.id, mode)
        blob = res.blob
        mimeType = res.mimeType || mimeType
      }

      if (mode === "view" && isInlinePreviewable(mimeType, att.name)) {
        if (previewFile?.objectUrl) URL.revokeObjectURL(previewFile.objectUrl)
        const objectUrl = URL.createObjectURL(blob)
        setPreviewFile({ name: att.name, mimeType, objectUrl })
      } else {
        triggerBlobDownload(blob, att.name)
        if (mode === "view") {
          showToast(
            isTh
              ? `กำลังดาวน์โหลด "${att.name}" เพื่อเปิดใช้งาน`
              : `Downloading "${att.name}" to open`,
          )
        }
      }
    } catch (err: any) {
      showToast(
        err?.message ||
          (isTh ? "ไม่สามารถเปิดหรือดาวน์โหลดไฟล์เอกสารได้" : "Failed to load document"),
      )
    } finally {
      setLoadingAttId(null)
    }
  }

  const inputClass =
    "w-full rounded-lg bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 px-2.5 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"

  const displayLinks = isEditing ? editLinks : booking.relatedLinks || []
  const existingAttachments = (booking.attachments || []).filter(
    (a) => !removeAttachmentIds.includes(a.id),
  )
  const totalEditAttachments = existingAttachments.length + newAttachments.length

  const LabelValue: React.FC<{
    label: string
    value: React.ReactNode
    editing?: React.ReactNode
  }> = ({ label, value, editing }) => (
    <div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5">
        {label} :
      </p>
      {isEditing && editing ? (
        editing
      ) : (
        <div className="text-sm text-slate-800 dark:text-slate-100">{value}</div>
      )}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-3 h-3 rounded-full flex-none ${roomColor.dotClass} shadow-sm`}
              />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {isTh ? "จองห้องประชุม" : "Meeting Room Booking"}
                {booking.status === "approved" && (
                  <span className="ml-1.5 sm:ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ({isTh ? "อนุมัติ" : "Approved"})
                  </span>
                )}
                {booking.status === "pending" && (
                  <span className="ml-1.5 sm:ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ({isTh ? "รออนุมัติ" : "Pending"})
                  </span>
                )}
                {booking.status === "rejected" && (
                  <span className="ml-1.5 sm:ml-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    ({isTh ? "ปฏิเสธ" : "Rejected"})
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {isAdmin && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>{isTh ? "แก้ไขข้อมูล" : "Edit"}</span>
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
          <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
            {/* ── LEFT SIDEBAR ── */}
            <div className="w-full md:w-56 flex-none border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col md:overflow-y-auto">
              <div className="flex sm:flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-0 p-3 md:p-0 border-b border-slate-200 dark:border-slate-700">
                <div className="w-24 h-20 md:w-full md:h-36 flex-none rounded-xl md:rounded-none overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img
                    src={roomImgSrc}
                    alt={formatRoomName(room, language) || ""}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 md:p-3 space-y-1 md:space-y-1.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {formatRoomName(room, language)}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isTh ? "ความจุ" : "Capacity"}: {room?.capacity || "-"}{" "}
                    {t.people}
                  </p>
                  <div className="flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 mt-0.5 flex-none text-rose-400" />
                    <span>{formatRoomLocation(room?.location, language)}</span>
                  </div>
                </div>
              </div>

              {room?.equipment && room.equipment.length > 0 && (
                <div className="p-3 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isTh ? "สิ่งอำนวยความสะดวก" : "Equipment"}
                  </p>
                  <ul className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-1">
                    {room.equipment.map((eq, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-none">
                          <EquipmentIcon name={eq} />
                        </span>
                        <span className="flex-1 truncate">{eq}</span>
                        <span className="hidden md:inline text-slate-400 text-[11px]">
                          1 หน่วย
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 md:overflow-y-auto">
              <div className="p-4 space-y-3.5">
                {/* Meeting title */}
                <div className="text-center pb-2.5 border-b border-slate-200 dark:border-slate-700">
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
                    {formatDisplayDate(booking.date)} เวลา {booking.startTime} -{" "}
                    {booking.endTime} น.
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

                {/* 2-column detail grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {/* LEFT col */}
                  <div className="space-y-3">
                    <LabelValue
                      label={isTh ? "ประธาน" : "Chairman"}
                      value={
                        <span className="font-semibold">
                          {booking.chairman || (
                            <span className="text-slate-400 italic text-xs">
                              {isTh ? "ไม่ระบุ" : "—"}
                            </span>
                          )}
                        </span>
                      }
                      editing={
                        <input
                          type="text"
                          value={editChairman}
                          onChange={(e) => setEditChairman(e.target.value)}
                          placeholder={
                            isTh ? "ชื่อ-นามสกุล หรือตำแหน่ง" : "Name or position"
                          }
                          className={inputClass}
                        />
                      }
                    />

                    <LabelValue
                      label={isTh ? "จำนวนผู้เข้าร่วม" : "Attendees"}
                      value={
                        <span className="font-semibold">
                          {booking.attendees} {t.people}
                        </span>
                      }
                      editing={
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={room?.capacity || 200}
                          value={editAttendees}
                          onChange={(e) => {
                            const raw = e.target.value
                            if (raw === "") {
                              setEditAttendees("")
                              return
                            }
                            const digitsOnly = raw.replace(/[^0-9]/g, "")
                            setEditAttendees(digitsOnly.replace(/^0+(?=\d)/, ""))
                          }}
                          className={inputClass}
                        />
                      }
                    />

                    <LabelValue
                      label={
                        isTh ? "ระบบออนไลน์ที่ต้องการใช้" : "Online Meeting"
                      }
                      value={
                        <ul className="mt-0.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                          <li>
                            {!booking.onlineMeeting ||
                            booking.onlineMeeting === "ไม่ใช้ระบบออนไลน์"
                              ? isTh
                                ? "ไม่ใช้ระบบออนไลน์"
                                : "None"
                              : booking.onlineMeeting}
                          </li>
                        </ul>
                      }
                      editing={
                        <select
                          value={editOnlineMeeting}
                          onChange={(e) => setEditOnlineMeeting(e.target.value)}
                          className={inputClass}
                        >
                          <option value="none">
                            {isTh ? "ไม่ใช้ระบบออนไลน์" : "None"}
                          </option>
                          <option value="Zoom">Zoom</option>
                          <option value="Google Meet">Google Meet</option>
                          <option value="WebEx">WebEx</option>
                          <option value="MS Teams">MS Teams</option>
                          <option value="อื่นๆ (โปรดระบุในรายละเอียด)">
                            {isTh ? "อื่นๆ" : "Other"}
                          </option>
                        </select>
                      }
                    />

                    {/* Related links */}
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Link2 className="h-3.5 w-3.5 text-blue-500" />
                        <span>
                          {isTh ? "ลิงก์ที่เกี่ยวข้อง" : "Related Links"} :
                        </span>
                      </p>
                      {displayLinks.length > 0 ? (
                        <ul className="space-y-1.5 mt-1">
                          {displayLinks.map((link, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-1.5 min-w-0"
                            >
                              {isApprovedUser && link.url ? (
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
                                >
                                  <ExternalLink className="h-3 w-3 flex-none" />
                                  <span className="truncate">
                                    {link.title || link.url}
                                  </span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToast(
                                      !currentUser
                                        ? isTh
                                          ? "กรุณาเข้าสู่ระบบด้วยบัญชีที่ได้รับอนุมัติเพื่อเปิดลิงก์"
                                          : "Sign in with an approved account to open links"
                                        : isTh
                                          ? "เฉพาะผู้ที่แอดมินอนุมัติแล้วเท่านั้นจึงจะเปิดลิงก์ได้"
                                          : "Only admin-approved users can open links",
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-500 truncate cursor-pointer"
                                >
                                  <Lock className="h-3 w-3 text-amber-500 flex-none" />
                                  <span className="truncate">
                                    {link.title ||
                                      (isTh ? "ลิงก์ที่เกี่ยวข้อง" : "Protected Link")}
                                  </span>
                                </button>
                              )}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLink(idx)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer flex-none"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {isTh ? "ยังไม่มีลิงก์" : "No links"}
                        </p>
                      )}
                      {isEditing && (
                        <div className="mt-2 space-y-1.5">
                          <input
                            type="text"
                            placeholder={isTh ? "ชื่อลิงก์" : "Link title"}
                            value={newLinkTitle}
                            onChange={(e) => setNewLinkTitle(e.target.value)}
                            className={inputClass}
                          />
                          <div className="flex gap-1">
                            <input
                              type="url"
                              placeholder="https://..."
                              value={newLinkUrl}
                              onChange={(e) => setNewLinkUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddLink()
                                }
                              }}
                              className={`${inputClass} flex-1`}
                            />
                            <button
                              type="button"
                              onClick={handleAddLink}
                              disabled={!newLinkUrl.trim()}
                              className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer flex-none"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT col */}
                  <div className="space-y-3">
                    <LabelValue
                      label={isTh ? "หน่วยงานที่จอง" : "Department"}
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
                              {formatDepartment(
                                user?.department,
                                user?.role,
                                language,
                              )}
                            </p>
                          </div>
                        </div>
                      }
                    />

                    <LabelValue
                      label={isTh ? "ประสานงานผ่าน" : "Contact Person"}
                      value={
                        <span className="font-semibold">
                          {booking.contactPerson || (
                            <span className="text-slate-400 italic text-xs">
                              {isTh ? "ไม่ระบุ" : "—"}
                            </span>
                          )}
                        </span>
                      }
                      editing={
                        <input
                          type="text"
                          value={editContactPerson}
                          onChange={(e) => setEditContactPerson(e.target.value)}
                          placeholder={isTh ? "ชื่อ / เบอร์ติดต่อ" : "Name / Phone"}
                          className={inputClass}
                        />
                      }
                    />

                    <LabelValue
                      label={isTh ? "ช่วงเวลา" : "Time Slot"}
                      value={
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          {booking.startTime} – {booking.endTime} น.
                        </span>
                      }
                    />

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      {isTh ? "จองเมื่อ" : "Booked on"} {booking.createdAt}
                    </p>
                  </div>
                </div>

                {/* ── Attached Documents Section ── */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Paperclip className="h-3.5 w-3.5 text-purple-500" />
                      <span>
                        {isTh
                          ? "เอกสารที่เกี่ยวข้อง"
                          : "Related Documents"}
                      </span>
                      {existingAttachments.length + newAttachments.length > 0 && (
                        <span className="ml-1 rounded-full bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                          {existingAttachments.length + newAttachments.length}
                        </span>
                      )}
                    </p>

                    {isEditing && totalEditAttachments < MAX_ATTACHMENTS && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ACCEPTED_ATTACHMENT_ATTR}
                          onChange={handleEditFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          <span>{isTh ? "แนบไฟล์เพิ่ม" : "Add File"}</span>
                        </button>
                      </>
                    )}
                  </div>

                  {existingAttachments.length === 0 &&
                  newAttachments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      {isTh ? "ยังไม่มีไฟล์เอกสารแนบ" : "No attached documents"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Access Notice Banner for non-approved users */}
                      {!isApprovedUser && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
                          <div className="flex items-start gap-2">
                            <Lock className="h-4 w-4 text-amber-500 flex-none mt-0.5" />
                            <span>
                              {!currentUser
                                ? isTh
                                  ? "สงวนสิทธิ์การเปิดดูและดาวน์โหลดเอกสารเฉพาะผู้ใช้งานที่ได้รับการอนุมัติจากผู้ดูแลระบบแล้วเท่านั้น"
                                  : "Only admin-approved members can view or download attached documents."
                                : isTh
                                  ? "บัญชีของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ เมื่อได้รับการอนุมัติแล้วจะสามารถเปิดดูและดาวน์โหลดเอกสารได้"
                                  : "Your account is awaiting admin approval before you can open or download documents."}
                            </span>
                          </div>
                          {!currentUser && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                navigate("/login")
                              }}
                              className="inline-flex items-center justify-center gap-1.5 flex-none rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer"
                            >
                              <LogIn className="h-3.5 w-3.5" />
                              <span>{isTh ? "เข้าสู่ระบบ" : "Sign In"}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Existing saved attachments */}
                      {existingAttachments.map((att) => {
                        const isViewing = loadingAttId === `${att.id}:view`
                        const isDownloading =
                          loadingAttId === `${att.id}:download`
                        const previewable = isInlinePreviewable(
                          att.mimeType,
                          att.name,
                        )
                        return (
                          <div
                            key={att.id}
                            className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                              isApprovedUser
                                ? "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-700"
                                : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 opacity-85"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <AttachmentTypeBadge
                                mimeType={att.mimeType}
                                fileName={att.name}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {att.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {formatFileSize(att.size)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-none">
                              {isApprovedUser ? (
                                <>
                                  {previewable && (
                                    <button
                                      type="button"
                                      disabled={!!loadingAttId}
                                      onClick={() =>
                                        handleOpenOrDownloadAttachment(
                                          att,
                                          "view",
                                        )
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                      {isViewing ? (
                                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                      )}
                                      <span>{isTh ? "เปิดดู" : "View"}</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={!!loadingAttId}
                                    onClick={() =>
                                      handleOpenOrDownloadAttachment(
                                        att,
                                        "download",
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    {isDownloading ? (
                                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Download className="h-3.5 w-3.5" />
                                    )}
                                    <span>
                                      {isTh ? "ดาวน์โหลด" : "Download"}
                                    </span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenOrDownloadAttachment(
                                      att,
                                      "download",
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 cursor-pointer"
                                >
                                  <Lock className="h-3 w-3" />
                                  <span>
                                    {isTh ? "เฉพาะผู้ได้รับอนุมัติ" : "Locked"}
                                  </span>
                                </button>
                              )}

                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRemoveAttachmentIds((prev) => [
                                      ...prev,
                                      att.id,
                                    ])
                                  }
                                  title={isTh ? "ลบไฟล์นี้" : "Remove file"}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* Newly staged attachments in Admin Edit Mode */}
                      {isEditing &&
                        newAttachments.map((file, idx) => (
                          <div
                            key={`new-${file.name}-${idx}`}
                            className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-purple-400 dark:border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AttachmentTypeBadge
                                mimeType={file.mimeType}
                                fileName={file.name}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {file.name}
                                </p>
                                <p className="text-[11px] text-purple-600 dark:text-purple-300">
                                  {formatFileSize(file.size)} ·{" "}
                                  {isTh ? "รอกดบันทึก" : "Pending save"}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAttachments((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer flex-none"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
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
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving
                    ? isTh
                      ? "กำลังบันทึก..."
                      : "Saving..."
                    : isTh
                      ? "บันทึกการเปลี่ยนแปลง"
                      : "Save Changes"}
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

      {/* ── In-App Document Preview Modal (PDF / Image / Text) ── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <AttachmentTypeBadge
                  mimeType={previewFile.mimeType}
                  fileName={previewFile.name}
                />
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {previewFile.name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <a
                  href={previewFile.objectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {isTh ? "เปิดแท็บใหม่" : "New Tab"}
                  </span>
                </a>
                <a
                  href={previewFile.objectUrl}
                  download={previewFile.name}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? "ดาวน์โหลด" : "Download"}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto flex items-center justify-center p-2 sm:p-4">
              {previewFile.mimeType.startsWith("image/") ? (
                <img
                  src={previewFile.objectUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                />
              ) : (
                <iframe
                  src={previewFile.objectUrl}
                  title={previewFile.name}
                  className="w-full h-full rounded-xl bg-white border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BookingDetailModal
