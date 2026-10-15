import React, { useState } from "react"
import {
  X,
  User as UserIcon,
  Mail,
  Building2,
  CreditCard,
  Phone,
  Home,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Edit2,
  Clock,
  KeyRound,
  Loader2,
  Hash,
} from "lucide-react"
import { User } from "../../types"
import { useApp } from "../../context/AppContext"
import { formatUserName, formatDepartment } from "../../constants/translations"
import { DEPARTMENTS } from "../../constants/departments"
import * as api from "../../services/api"

interface UserDetailModalProps {
  user: User | null
  onClose: () => void
  onEditUser?: (user: User) => void
  onApproveUser?: (user: User, department: string) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onEditUser,
  onApproveUser,
}) => {
  const { language, showToast } = useApp()
  const [resetting, setResetting] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>("กลุ่มงานการพยาบาล")
  const [customDept, setCustomDept] = useState<string>("")

  if (!user) return null

  const handleResetPassword = async () => {
    if (!confirm(language === "th" ? `ยืนยันการส่งอีเมลรีเซ็ตรหัสผ่านให้ ${user.name}?` : `Send password reset email to ${user.name}?`)) return
    setResetting(true)
    try {
      const res = await api.sendPasswordReset(user.id)
      showToast(language === "th" ? "ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ" : "Password reset email sent")
      if (res.dev_token) {
        console.log("DEV RESET LINK:", res.reset_link)
      }
    } catch (err: any) {
      showToast(language === "th" ? "เกิดข้อผิดพลาดในการส่งอีเมล" : "Failed to send email")
    } finally {
      setResetting(false)
    }
  }

  const isPending =
    !user.department ||
    user.department === "รอการตรวจสอบ" ||
    user.department === "-"

  const isAdmin = user.role === "admin"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {language === "th"
                  ? "ข้อมูลสมาชิกและประวัติผู้ใช้งาน"
                  : "Member Profile & Details"}
              </h3>
              <p className="text-[11px] text-blue-100">
                {user.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Pending Approval Banner */}
          {isPending && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-none" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {language === "th"
                      ? "ผู้ใช้งานนี้กำลังรอการตรวจสอบและกำหนดกลุ่มงาน/แผนก"
                      : "User is pending department assignment"}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {language === "th"
                      ? "เลือกกลุ่มงาน/แผนกที่สังกัดเพื่ออนุมัติสิทธิ์การใช้งาน"
                      : "Select department before approving access"}
                  </p>
                </div>
              </div>

              {onApproveUser && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex-1 flex gap-2">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/70 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="อื่นๆ">{language === "th" ? "อื่นๆ (ระบุเอง)" : "Other (Specify)"}</option>
                    </select>

                    {selectedDept === "อื่นๆ" && (
                      <input
                        type="text"
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        placeholder={language === "th" ? "ระบุชื่อแผนก..." : "Specify department..."}
                        className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/70 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const finalDept = selectedDept === "อื่นๆ" ? (customDept.trim() || "ทั่วไป") : selectedDept
                      onApproveUser(user, finalDept)
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex-none"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{language === "th" ? "ยืนยันอนุมัติ" : "Approve User"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Profile Card Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="h-16 w-16 flex-none rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md">
              <img
                src={user.avatarUrl || "/user.jpg"}
                alt={formatUserName(user, language)}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                }}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                  {formatUserName(user, language)}
                </h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isAdmin
                      ? "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : isPending
                        ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <UserIcon className="h-3 w-3" />
                  )}
                  <span>
                    {isAdmin
                      ? language === "th" ? "ผู้ดูแลระบบ" : "Admin"
                      : isPending
                        ? language === "th" ? "รอการตรวจสอบ" : "Pending"
                        : language === "th" ? "สมาชิกทั่วไป" : "Member"}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDepartment(user.department, user.role, language)}</span>
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Username / Email */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 w-36 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "อีเมล / ชื่อผู้ใช้" : "Username"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold">
                    <div className="flex items-center gap-2">
                      {user.username}
                      {user.emailVerified ? (
                        <span title={language === "th" ? "ยืนยันแล้ว" : "Verified"}>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        </span>
                      ) : (
                        <span className="flex h-3.5 items-center rounded-full bg-rose-100 dark:bg-rose-900/50 px-1.5 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                          {language === "th" ? "ยังไม่ยืนยัน" : "Unverified"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Member ID */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "รหัสสมาชิก" : "Member ID"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold tracking-wider">
                    {user.member_id || (language === "th" ? "ไม่ระบุ" : "Not specified")}
                  </td>
                </tr>

                {/* Gender */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">#</span>
                      <span>{language === "th" ? "เพศ" : "Gender"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">
                    {user.gender || (language === "th" ? "ไม่ระบุ" : "Not specified")}
                  </td>
                </tr>

                {/* Citizen ID */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "เลขประชาชน" : "Citizen ID"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-mono">
                    {user.citizenId || "-"}
                  </td>
                </tr>

                {/* Phone */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "โทรศัพท์" : "Phone"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">
                    {user.phone ? (
                      <a
                        href={`tel:${user.phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        {user.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>

                {/* Address */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap align-top">
                    <span className="flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "ที่อยู่" : "Address"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">
                    {user.address || "-"}
                  </td>
                </tr>

                {/* Province & Zipcode */}
                <tr>
                  <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{language === "th" ? "จังหวัด / รหัส" : "Province"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200">
                    {user.province || "ปทุมธานี"}{" "}
                    {user.zipcode ? `(${user.zipcode})` : ""}{" "}
                    {user.country ? `• ${user.country}` : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {language === "th" ? "ปิด" : "Close"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetPassword}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
              <span>{language === "th" ? "รีเซ็ตรหัสผ่าน" : "Reset Pass"}</span>
            </button>

            {onEditUser && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEditUser(user)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{language === "th" ? "แก้ไขข้อมูลผู้ใช้" : "Edit User"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
