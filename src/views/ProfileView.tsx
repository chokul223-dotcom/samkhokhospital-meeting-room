import React, { useState, useEffect } from "react"
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CreditCard,
  Phone,
  Home,
  Globe,
  MapPin,
  Hash,
  Camera,
  CameraOff,
  Image as ImageIcon,
  Star,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { User } from "../types"
import * as api from "../services/api"

interface ProfileViewProps {
  onBack?: () => void
}

const DEPARTMENTS = [
  "กลุ่มงานการพยาบาล",
  "ศูนย์คอมพิวเตอร์และสารสนเทศ",
  "กลุ่มงานเภสัชกรรม",
  "กลุ่มงานศัลยศาสตร์",
  "กลุ่มงานอายุรกรรม",
  "กลุ่มงานทันตกรรม",
  "กลุ่มงานเวชศาสตร์ฉุกเฉิน",
  "กลุ่มงานเทคนิคการแพทย์",
  "กลุ่มงานรังสีวิทยา",
  "กลุ่มงานบริหารทั่วไป",
  "กลุ่มกฎหมาย",
  "กลุ่มงานยุทธศาสตร์และแผนงาน",
  "กลุ่มงานประกันสุขภาพ",
  "กลุ่มงานพัฒนาคุณภาพบริการ",
  "ทั่วไป",
]

const PROVINCES = [
  "ปทุมธานี",
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "พระนครศรีอยุธยา",
  "สมุทรปราการ",
  "สมุทรสาคร",
  "นครปฐม",
  "สระบุรี",
  "ลพบุรี",
  "สุพรรณบุรี",
  "นครนายก",
  "ฉะเชิงเทรา",
  "ชลบุรี",
]

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { currentUser, language, handleUpdateProfile, showToast } = useApp()

  // Form state
  const [username, setUsername] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [name, setName] = useState("")
  const [gender, setGender] = useState("ไม่ระบุ")
  const [department, setDepartment] = useState("ทั่วไป")
  const [customDepartment, setCustomDepartment] = useState("")
  const [citizenId, setCitizenId] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState("ไทย")
  const [province, setProvince] = useState("ปทุมธานี")
  const [zipcode, setZipcode] = useState("")

  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [deleteAvatar, setDeleteAvatar] = useState(false)
  const [role, setRole] = useState<"admin" | "user">("user")
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingVerify, setSendingVerify] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [isEmailUnlocked, setIsEmailUnlocked] = useState(false)
  const [showEmailUnlockModal, setShowEmailUnlockModal] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState("")
  const [showUnlockPassword, setShowUnlockPassword] = useState(false)
  const [unlockError, setUnlockError] = useState("")

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "")
      setName(currentUser.name || "")
      setRole(currentUser.role || "user")
      setGender(currentUser.gender || "ไม่ระบุ")
      setCitizenId(currentUser.citizenId || "")
      setPhone(currentUser.phone || "")
      setAddress(currentUser.address || "")
      setCountry(currentUser.country || "ไทย")
      setProvince(currentUser.province || "ปทุมธานี")
      setZipcode(currentUser.zipcode || "")
      setAvatarUrl(currentUser.avatarUrl || "")
      setDeleteAvatar(false)
      setEmailVerified(!!currentUser.emailVerified)

      const dept = currentUser.department || "ทั่วไป"
      if (DEPARTMENTS.includes(dept)) {
        setDepartment(dept)
        setCustomDepartment("")
      } else {
        setDepartment("อื่นๆ")
        setCustomDepartment(dept)
      }
    }
  }, [currentUser])

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError(
          language === "th"
            ? "ขนาดไฟล์รูปภาพต้องไม่เกิน 3MB"
            : "Image file size must be less than 3MB",
        )
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
        setDeleteAvatar(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendVerifyEmail = async () => {
    if (!currentUser) return
    setSendingVerify(true)
    try {
      const res = await api.sendVerifyEmail(currentUser.id)
      showToast(language === "th" ? "ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ" : "Verification link sent to your email")
      if (res.dev_token) {
        console.log("DEV VERIFY LINK:", res.verify_link)
        // Show alert in dev mode so user can click it if they don't have Resend API configured
        alert(`[Dev Mode]\nไม่ได้ตั้งค่า RESEND_API_KEY\nคุณสามารถคลิกลิงก์นี้เพื่อยืนยันอีเมล:\n\n${res.verify_link}`)
      }
    } catch (err: any) {
      showToast(err.message || (language === "th" ? "ไม่สามารถส่งอีเมลยืนยันได้" : "Failed to send verification email"))
    } finally {
      setSendingVerify(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentUser) return
    if (!oldPassword) {
      setError(language === "th" ? "กรุณาระบุรหัสผ่านเดิม" : "Please specify old password")
      return
    }
    if (newPassword.length < 4) {
      setError(language === "th" ? "รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร" : "New password must be at least 4 characters")
      return
    }

    setError("")
    setSuccess("")
    setIsChangingPassword(true)

    try {
      await api.changePassword(currentUser.id, oldPassword, newPassword)
      setSuccess(language === "th" ? "เปลี่ยนรหัสผ่านสำเร็จ" : "Password changed successfully")
      setOldPassword("")
      setNewPassword("")
    } catch (err: any) {
      setError(err.message || (language === "th" ? "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" : "Failed to change password"))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError(language === "th" ? "กรุณาระบุ ชื่อ-นามสกุล" : "Please specify Name")
      return
    }

    const finalDepartment =
      department === "อื่นๆ" ? customDepartment.trim() || "ทั่วไป" : department

    setIsSubmitting(true)
    try {
      if (!currentUser) throw new Error("User not found")

      const updateData: Partial<User> & { id: string } = {
        id: currentUser.id,
        name: name.trim(),
        username: username.trim(),
        department: finalDepartment,
        gender,
        citizenId: citizenId.trim(),
        phone: phone.trim(),
        address: address.trim(),
        country: country.trim(),
        province: province.trim(),
        zipcode: zipcode.trim(),
        role: currentUser.role === "admin" ? role : currentUser.role,
        avatarUrl: deleteAvatar ? "" : avatarUrl,
      }

      await handleUpdateProfile(updateData)
      setSuccess(
        language === "th"
          ? "บันทึกข้อมูลส่วนตัวสำเร็จเรียบร้อยแล้ว"
          : "Profile updated successfully",
      )
    } catch (err: any) {
      setError(err.message || (language === "th" ? "เกิดข้อผิดพลาดในการบันทึก" : "Failed to update profile"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200 select-none">
      {/* ─── Top Hospital Header Brand ─── */}
      <div className="text-center pt-2 pb-1">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white p-1 shadow-md border border-slate-200 dark:border-slate-700">
          <img
            src="/logo.png"
            alt="Hospital Logo"
            className="h-full w-full object-contain rounded-full"
          />
        </div>
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {language === "th" ? "ระบบจองห้องประชุมออนไลน์" : "Online Meeting Room Booking System"}
        </h2>
      </div>

      {/* ─── Main Profile Form Card ─── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 flex-wrap">
            <UserIcon className="h-3.5 w-3.5 text-slate-500" />
            <span>{language === "th" ? "สมาชิก" : "Members"}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span>{language === "th" ? "รายชื่อสมาชิก" : "Member List"}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {language === "th" ? "แก้ไข" : "Edit"}
            </span>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{language === "th" ? "ย้อนกลับ" : "Back"}</span>
            </button>
          )}
        </div>

        {/* Card Header Title */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <span className="text-lg">📋</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === "th" ? "แก้ไขข้อมูลส่วนตัว" : "Edit Personal Information"}
          </h3>
        </div>

        {/* ─── Form Body ─── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Section 1: Account / Email & Password ── */}
          <div className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center justify-between">
                  <span>{language === "th" ? "อีเมล / ชื่อผู้ใช้" : "Email / Username"}</span>
                  {emailVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      {language === "th" ? "ยืนยันแล้ว" : "Verified"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      {language === "th" ? "ยังไม่ยืนยันอีเมล" : "Unverified"}
                    </span>
                  )}
                </div>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    readOnly={!isEmailUnlocked}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${!isEmailUnlocked
                      ? "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      : "bg-slate-50 dark:bg-slate-800 border-blue-400 dark:border-blue-500 text-slate-900 dark:text-white"
                      }`}
                  />
                </div>
                {!isEmailUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockPassword("")
                      setUnlockError("")
                      setShowEmailUnlockModal(true)
                    }}
                    className="flex-none flex items-center justify-center rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    {language === "th" ? "เปลี่ยนอีเมล" : "Change Email"}
                  </button>
                ) : !emailVerified && username === currentUser?.username && (
                  <button
                    type="button"
                    onClick={handleSendVerifyEmail}
                    disabled={sendingVerify}
                    className="flex-none flex items-center justify-center rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sendingVerify ? "..." : (language === "th" ? "ยืนยันอีเมล" : "Verify")}
                  </button>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                {language === "th"
                  ? "เมื่อเปลี่ยนอีเมล คุณจะต้องทำการยืนยันอีเมลใหม่อีกครั้ง"
                  : "If you change your email, you will need to verify it again"}
              </p>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "รหัสผ่านเดิม" : "Old Password"}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder={
                      language === "th"
                        ? "รหัสผ่านเดิมของคุณ"
                        : "Your old password"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((v) => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {language === "th"
                    ? "ถ้าต้องการเปลี่ยนรหัสผ่าน กรุณากรอกรหัสผ่านเดิม"
                    : "To change password, please enter your old password"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "รหัสผ่านใหม่" : "New Password"}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={
                      language === "th"
                        ? "รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                        : "New password (min 4 chars)"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPassword || !oldPassword || !newPassword}
                className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-2 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword
                  ? (language === "th" ? "กำลังเปลี่ยน..." : "Changing...")
                  : (language === "th" ? "ยืนยันการเปลี่ยนรหัสผ่าน" : "Confirm Password Change")
                }
              </button>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* ── Section 2: Member Details ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {language === "th" ? "รายละเอียดของ สมาชิก" : "Member Details"}
            </h4>

            {/* Name and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "ชื่อ นามสกุล" : "Full Name"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      language === "th" ? "เช่น พว. สมศรี ใจดี" : "e.g. John Doe"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "เพศ" : "Gender"}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    #
                  </span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="ไม่ระบุ">{language === "th" ? "ไม่ระบุ" : "Not specified"}</option>
                    <option value="ชาย">{language === "th" ? "ชาย" : "Male"}</option>
                    <option value="หญิง">{language === "th" ? "หญิง" : "Female"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === "th" ? "แผนก / หน่วยงาน" : "Department"}
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="อื่นๆ">{language === "th" ? "อื่นๆ (ระบุเอง)" : "Other (Custom)"}</option>
                </select>
              </div>

              {department === "อื่นๆ" && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder={
                      language === "th"
                        ? "ระบุชื่อแผนกของคุณ"
                        : "Specify your department"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Citizen ID & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "เลขประจำตัวประชาชน" : "Citizen ID"}
                </label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={13}
                    value={citizenId}
                    onChange={(e) =>
                      setCitizenId(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder={
                      language === "th" ? "เลข 13 หลัก" : "13-digit ID"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "โทรศัพท์" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={
                      language === "th" ? "เช่น 081-234-5678" : "e.g. 081-234-5678"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === "th" ? "ที่อยู่" : "Address"}
              </label>
              <div className="relative">
                <Home className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    language === "th"
                      ? "บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"
                      : "Address details"
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Country, Province, Zipcode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "ประเทศ" : "Country"}
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="ไทย"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "จังหวัด" : "Province"}
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "th" ? "รหัสไปรษณีย์" : "Zipcode"}
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={5}
                    value={zipcode}
                    onChange={(e) =>
                      setZipcode(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="12160"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="pt-2 space-y-3">
              {/* Checkbox: Delete Avatar */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteAvatar}
                  onChange={(e) => setDeleteAvatar(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>{language === "th" ? "ลบ รูปสมาชิก" : "Delete Member Avatar"}</span>
              </label>

              {/* Avatar Preview Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-24 w-24 flex-none rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-inner">
                  {deleteAvatar ? (
                    <div className="flex flex-col items-center text-slate-400">
                      <CameraOff className="h-8 w-8 stroke-1" />
                      <span className="text-[10px] mt-1 font-bold">
                        {language === "th" ? "ไม่มีรูป" : "No photo"}
                      </span>
                    </div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarUrl("")}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Camera className="h-8 w-8 stroke-1" />
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === "th" ? "รูปสมาชิก" : "Member Photo"}
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span>
                      {language === "th"
                        ? "เลือกรูปภาพอัปโหลด"
                        : "Choose image to upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === "th"
                      ? "เลือกรูปภาพอัปโหลด ชนิด jpg, jpeg, png, webp (ปรับขนาดอัตโนมัติ)"
                      : "Supports jpg, jpeg, png, webp (auto-resized)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* ── Section 3: Others ── */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {language === "th" ? "อื่นๆ" : "Others"}
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === "th" ? "สถานะสมาชิก" : "Member Status"}
              </label>
              <div className="relative max-w-sm">
                <Star className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                <select
                  value={role}
                  disabled={currentUser?.role !== "admin"}
                  onChange={(e) => setRole(e.target.value as any)}
                  className={`w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white ${currentUser?.role !== "admin"
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    }`}
                >
                  <option value="user">
                    {language === "th" ? "สมาชิก (บุคลากรทั่วไป)" : "Member (Staff)"}
                  </option>
                  <option value="admin">
                    {language === "th" ? "ผู้ดูแลระบบ (Admin)" : "Administrator (Admin)"}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 flex-none" />
              <span>{success}</span>
            </div>
          )}

          {/* ── Submit Action Button (Green button like in Picture 2) ── */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#2e7d32] hover:bg-[#256629] text-white px-6 py-2.5 text-sm font-bold shadow-md shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? language === "th"
                    ? "กำลังบันทึก..."
                    : "Saving..."
                  : language === "th"
                    ? "บันทึก"
                    : "Save"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Modal for Unlocking Email */}
      {showEmailUnlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {language === "th" ? "ยืนยันตัวตนเพื่อเปลี่ยนอีเมล" : "Verify Identity"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {language === "th" ? "กรุณากรอกรหัสผ่านเพื่อยืนยันการปลดล็อกอีเมล" : "Please enter your password to unlock the email field."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type={showUnlockPassword ? "text" : "password"}
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder={language === "th" ? "รหัสผ่านของคุณ" : "Your Password"}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showUnlockPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {unlockError && (
                <p className="text-xs font-bold text-rose-500 text-center">{unlockError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailUnlockModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 text-sm font-bold transition-colors cursor-pointer"
                >
                  {language === "th" ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (unlockPassword.length < 4) {
                      setUnlockError(language === "th" ? "รหัสผ่านไม่ถูกต้อง" : "Invalid password")
                      return
                    }
                    setIsEmailUnlocked(true)
                    setShowEmailUnlockModal(false)
                  }}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-bold transition-colors cursor-pointer"
                >
                  {language === "th" ? "ยืนยัน" : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileView
