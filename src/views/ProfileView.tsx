import React, { useState, useEffect } from "react"
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Phone,
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
  Copy,
  Check,
  Send,
  ShieldCheck,
  KeyRound,
  Trash2,
  RotateCcw,
  X,
  Clock,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { User } from "../types"
import * as api from "../services/api"
import { DEPARTMENTS } from "../constants/departments"

interface ProfileViewProps {
  onBack?: () => void
}

const MAX_AVATAR_DIMENSION = 360
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function resizeAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        let { width, height } = img
        if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION) {
          const ratio = Math.min(MAX_AVATAR_DIMENSION / width, MAX_AVATAR_DIMENSION / height)
          width = Math.max(1, Math.round(width * ratio))
          height = Math.max(1, Math.round(height * ratio))
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas not supported"))
          return
        }
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.84)
        resolve(dataUrl)
      } catch (err) {
        reject(err)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Invalid image file"))
    }
    img.src = objectUrl
  })
}

function getPasswordStrength(pwd: string, th: boolean): { label: string; color: string; level: number } {
  if (!pwd) return { label: "", color: "", level: 0 }
  let score = 0
  if (pwd.length >= 6) score += 1
  if (pwd.length >= 10) score += 1
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1

  if (pwd.length < 6) {
    return {
      label: th ? "สั้นเกินไป (อย่างน้อย 6 ตัวอักษร)" : "Too short (min 6 chars)",
      color: "text-rose-500",
      level: 1,
    }
  }
  if (score <= 2) {
    return {
      label: th ? "ความปลอดภัย: พอใช้" : "Strength: Fair",
      color: "text-amber-500",
      level: 2,
    }
  }
  if (score <= 3) {
    return {
      label: th ? "ความปลอดภัย: ดี" : "Strength: Good",
      color: "text-blue-500",
      level: 3,
    }
  }
  return {
    label: th ? "ความปลอดภัย: แข็งแรงมาก" : "Strength: Strong",
    color: "text-emerald-500",
    level: 4,
  }
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const { currentUser, language, handleUpdateProfile, showToast } = useApp()
  const th = language === "th"

  // Profile form state
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [gender, setGender] = useState("ไม่ระบุ")
  const [department, setDepartment] = useState("ทั่วไป")
  const [customDepartment, setCustomDepartment] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [deleteAvatar, setDeleteAvatar] = useState(false)
  const [role, setRole] = useState<"admin" | "user">("user")
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingVerify, setSendingVerify] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [copiedId, setCopiedId] = useState(false)

  // Email unlock modal state
  const [isEmailUnlocked, setIsEmailUnlocked] = useState(false)
  const [showEmailUnlockModal, setShowEmailUnlockModal] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState("")
  const [unlockPwdEditable, setUnlockPwdEditable] = useState(false)
  const [showUnlockPassword, setShowUnlockPassword] = useState(false)
  const [unlockError, setUnlockError] = useState("")
  const [isVerifyingUnlock, setIsVerifyingUnlock] = useState(false)

  // Standalone Change Password form state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [oldPwdEditable, setOldPwdEditable] = useState(false)
  const [newPwdEditable, setNewPwdEditable] = useState(false)
  const [confirmPwdEditable, setConfirmPwdEditable] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [pwdError, setPwdError] = useState("")
  const [pwdSuccess, setPwdSuccess] = useState("")

  // ผู้ใช้ที่ยังรอแอดมินอนุมัติ — ห้ามแก้ไขแผนกเอง (แอดมินเป็นผู้กำหนดเมื่ออนุมัติ)
  const PENDING_DEPARTMENT = "รอการตรวจสอบ"
  const isPendingDepartment =
    !currentUser?.department ||
    currentUser.department === PENDING_DEPARTMENT ||
    currentUser.department === "-"
  const isDepartmentLocked = isPendingDepartment && currentUser?.role !== "admin"

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "")
      setEmail(currentUser.email || currentUser.username || "")
      setName(currentUser.name || "")
      setPosition(currentUser.position || "")
      setRole(currentUser.role || "user")
      setGender(currentUser.gender || "ไม่ระบุ")
      setPhone(currentUser.phone || "")
      setAvatarUrl(currentUser.avatarUrl || "")
      setDeleteAvatar(false)
      setEmailVerified(Boolean(currentUser.emailVerified))

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

  const normalizedSavedEmail = (currentUser?.email || "").trim().toLowerCase()
  const normalizedInputEmail = email.trim().toLowerCase()
  const isEmailDirty = Boolean(isEmailUnlocked && normalizedInputEmail !== normalizedSavedEmail)
  const canSendVerifyEmail = Boolean(
    !emailVerified &&
      normalizedSavedEmail &&
      normalizedInputEmail === normalizedSavedEmail,
  )

  const handleCopyMemberId = async () => {
    if (!currentUser?.member_id) return
    try {
      await navigator.clipboard.writeText(currentUser.member_id)
      setCopiedId(true)
      showToast(th ? "คัดลอกรหัสสมาชิกแล้ว" : "Member ID copied")
      setTimeout(() => setCopiedId(false), 1800)
    } catch {
      showToast(th ? "ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง" : "Unable to copy")
    }
  }

  // Handle avatar upload with client-side canvas resize
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setProfileError("")
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setProfileError(
        th
          ? "รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น"
          : "Only JPG, PNG, or WEBP images are supported",
      )
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setProfileError(
        th ? "ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB" : "Image file size must be less than 5MB",
      )
      return
    }

    try {
      const resized = await resizeAvatarImage(file)
      setAvatarUrl(resized)
      setDeleteAvatar(false)
    } catch {
      setProfileError(
        th
          ? "ไม่สามารถอ่านไฟล์รูปภาพนี้ได้ กรุณาลองเลือกไฟล์อื่น"
          : "Could not process this image file",
      )
    }
  }

  const handleSendVerifyEmail = async () => {
    if (!currentUser) return
    setSendingVerify(true)
    try {
      const res = await api.sendVerifyEmail(currentUser.id)
      showToast(
        th
          ? "ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ"
          : "Verification link sent to your email",
      )
      if (res.dev_token) {
        console.log("DEV VERIFY LINK:", res.verify_link)
        alert(
          `[Dev Mode]\nไม่ได้ตั้งค่า RESEND_API_KEY\nคุณสามารถคลิกลิงก์นี้เพื่อยืนยันอีเมล:\n\n${res.verify_link}`,
        )
      }
    } catch (err: any) {
      showToast(
        err.message ||
          (th ? "ไม่สามารถส่งอีเมลยืนยันได้" : "Failed to send verification email"),
      )
    } finally {
      setSendingVerify(false)
    }
  }

  const handleVerifyUnlockEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlockPassword) {
      setUnlockError(th ? "กรุณากรอกรหัสผ่านของคุณ" : "Please enter your password")
      return
    }
    if (!currentUser?.id) return

    setUnlockError("")
    setIsVerifyingUnlock(true)
    try {
      await api.verifyPassword(currentUser.id, unlockPassword)
      setIsEmailUnlocked(true)
      setShowEmailUnlockModal(false)
      setUnlockPassword("")
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError")
      setUnlockError(
        isNetworkError
          ? th
            ? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อตรวจสอบรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง"
            : "Cannot connect to server to verify password. Please try again."
          : err.message || (th ? "รหัสผ่านไม่ถูกต้อง" : "Invalid password"),
      )
    } finally {
      setIsVerifyingUnlock(false)
    }
  }

  const handleCancelEmailChange = () => {
    setIsEmailUnlocked(false)
    setEmail(currentUser?.email || currentUser?.username || "")
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setProfileSuccess("")

    if (!name.trim()) {
      setProfileError(th ? "กรุณาระบุชื่อ-นามสกุล" : "Please specify your full name")
      return
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setProfileError(th ? "รูปแบบอีเมลไม่ถูกต้อง" : "Invalid email address")
      return
    }

    const finalDepartment = isDepartmentLocked
      ? currentUser?.department || PENDING_DEPARTMENT
      : department === "อื่นๆ"
        ? customDepartment.trim() || "ทั่วไป"
        : department

    setIsSubmitting(true)
    try {
      if (!currentUser) throw new Error("User not found")

      const emailChanged = trimmedEmail !== normalizedSavedEmail
      const updateData: Partial<User> & { id: string } = {
        id: currentUser.id,
        name: name.trim(),
        username: username.trim() || currentUser.username,
        email: trimmedEmail,
        ...(emailChanged ? { emailVerified: false } : {}),
        department: finalDepartment,
        position: position.trim(),
        gender,
        phone: phone.trim(),
        role: currentUser.role === "admin" ? role : currentUser.role,
        avatarUrl: deleteAvatar ? "" : avatarUrl,
      }

      await handleUpdateProfile(updateData)
      setIsEmailUnlocked(false)
      setDeleteAvatar(false)
      setProfileSuccess(
        emailChanged
          ? th
            ? "บันทึกข้อมูลและอัปเดตอีเมลใหม่เรียบร้อยแล้ว กรุณากดปุ่มยืนยันอีเมลเพื่อยืนยันที่อยู่อีเมลใหม่"
            : "Profile and new email saved. Please verify your new email address."
          : th
            ? "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว"
            : "Profile updated successfully",
      )
    } catch (err: any) {
      setProfileError(
        err.message ||
          (th ? "เกิดข้อผิดพลาดในการบันทึกข้อมูล" : "Failed to update profile"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setPwdError("")
    setPwdSuccess("")

    if (!oldPassword) {
      setPwdError(th ? "กรุณาระบุรหัสผ่านเดิม" : "Please enter your current password")
      return
    }
    if (newPassword.length < 6) {
      setPwdError(
        th
          ? "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"
          : "New password must be at least 6 characters",
      )
      return
    }
    if (newPassword === oldPassword) {
      setPwdError(
        th
          ? "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"
          : "New password must be different from your current password",
      )
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPwdError(
        th
          ? "ยืนยันรหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง"
          : "New passwords do not match",
      )
      return
    }

    setIsChangingPassword(true)
    try {
      await api.changePassword(currentUser.id, oldPassword, newPassword)
      setPwdSuccess(
        th ? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" : "Password changed successfully",
      )
      showToast(th ? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" : "Password changed successfully")
      setOldPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setShowOldPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setOldPwdEditable(false)
      setNewPwdEditable(false)
      setConfirmPwdEditable(false)
    } catch (err: any) {
      setPwdError(
        err.message ||
          (th ? "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" : "Failed to change password"),
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  const pwdStrength = getPasswordStrength(newPassword, th)
  const passwordsMatch =
    confirmNewPassword.length > 0 && newPassword === confirmNewPassword
  const passwordsMismatch =
    confirmNewPassword.length > 0 && newPassword !== confirmNewPassword

  const previewAvatar = deleteAvatar ? "" : avatarUrl
  const initials = (name || currentUser?.name || "U").trim().slice(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* ─── Top Breadcrumb & Profile Summary Card ─── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 flex-wrap">
            <UserIcon className="h-3.5 w-3.5 text-purple-500" />
            <span>{th ? "บัญชีของฉัน" : "My Account"}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {th ? "ข้อมูลส่วนตัว" : "Profile"}
            </span>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-none flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{th ? "ย้อนกลับ" : "Back"}</span>
            </button>
          )}
        </div>

        {/* Profile Overview Hero */}
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] flex-none rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={name || "Avatar"}
                className="h-full w-full object-cover"
                onError={() => setAvatarUrl("")}
              />
            ) : (
              <span className="text-lg font-black text-white tracking-wider">
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                {name || currentUser?.name || (th ? "ผู้ใช้งาน" : "User")}
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  currentUser?.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    : isPendingDepartment
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {currentUser?.role === "admin" ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : isPendingDepartment ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                <span>
                  {currentUser?.role === "admin"
                    ? th
                      ? "ผู้ดูแลระบบ"
                      : "Admin"
                    : isPendingDepartment
                      ? th
                        ? "รอการตรวจสอบสิทธิ์"
                        : "Pending Approval"
                      : th
                        ? "บัญชีอนุมัติแล้ว"
                        : "Approved Staff"}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {position.trim() && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  <span>{position.trim()}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {isPendingDepartment
                    ? th
                      ? PENDING_DEPARTMENT
                      : "Pending Approval"
                    : department === "อื่นๆ"
                      ? customDepartment || "ทั่วไป"
                      : department}
                </span>
              </span>
            </div>
          </div>

          {/* Copyable Member ID Pill */}
          {currentUser?.member_id && (
            <div className="flex-none flex items-center gap-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 self-start sm:self-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {th ? "รหัสสมาชิก" : "Member ID"}
                </p>
                <p className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100">
                  #{currentUser.member_id}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyMemberId}
                title={th ? "คัดลอกรหัสสมาชิก" : "Copy Member ID"}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-300 transition-colors cursor-pointer"
              >
                {copiedId ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Card 1 & 2: Account Email + Personal & Work Profile Form ─── */}
      <form
        onSubmit={handleSubmitProfile}
        autoComplete="off"
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {th ? "ข้อมูลส่วนตัวและการทำงาน" : "Personal & Work Information"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {th
                  ? "ข้อมูลจะถูกบันทึกในระบบและซิงก์ทุกอุปกรณ์อัตโนมัติ"
                  : "Saved directly to the server and synced across devices"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* ── Email & Verification Section ── */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {th ? "อีเมลบัญชีผู้ใช้" : "Account Email"}
              </label>
              {emailVerified && !isEmailDirty ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  {th ? "ยืนยันอีเมลแล้ว" : "Email Verified"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200/70 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  {isEmailDirty
                    ? th
                      ? "รอบันทึกอีเมลใหม่"
                      : "Unsaved new email"
                    : th
                      ? "ยังไม่ยืนยันอีเมล"
                      : "Email Unverified"}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={isEmailUnlocked ? "email" : "text"}
                  name="profile-contact-email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!isEmailUnlocked}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/25 ${
                    !isEmailUnlocked
                      ? "bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      : "bg-white dark:bg-slate-900 border-purple-400 dark:border-purple-500 text-slate-900 dark:text-white"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {canSendVerifyEmail && (
                  <button
                    type="button"
                    onClick={handleSendVerifyEmail}
                    disabled={sendingVerify}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>
                      {sendingVerify
                        ? th
                          ? "กำลังส่ง..."
                          : "Sending..."
                        : th
                          ? "ยืนยันอีเมล"
                          : "Verify Email"}
                    </span>
                  </button>
                )}

                {!isEmailUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockPassword("")
                      setUnlockPwdEditable(false)
                      setShowUnlockPassword(false)
                      setUnlockError("")
                      setShowEmailUnlockModal(true)
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>{th ? "เปลี่ยนอีเมล" : "Change Email"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEmailChange}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>{th ? "ยกเลิก" : "Cancel"}</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isEmailDirty
                ? th
                  ? "กรุณากดปุ่ม \"บันทึกข้อมูลส่วนตัว\" ด้านล่างเพื่อบันทึกอีเมลใหม่ จากนั้นทำการยืนยันอีเมลใหม่อีกครั้ง"
                  : "Click \"Save Profile\" below to save your new email, then verify it again."
                : !emailVerified
                  ? th
                    ? "กดปุ่ม \"ยืนยันอีเมล\" เพื่อรับลิงก์ยืนยันตัวตนและเปิดใช้ระบบความปลอดภัย 2FA"
                    : "Click \"Verify Email\" to confirm your email address and enable 2FA security."
                  : th
                    ? "เมื่อเปลี่ยนอีเมล ระบบจะขอให้คุณยืนยันอีเมลใหม่อีกครั้งเพื่อความปลอดภัย"
                    : "Changing your email requires verifying the new address."}
            </p>
          </div>

          {/* ── Avatar Uploader ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            <div className="h-24 w-24 flex-none rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-inner">
              {deleteAvatar ? (
                <div className="flex flex-col items-center text-slate-400">
                  <CameraOff className="h-7 w-7 stroke-1.5" />
                  <span className="text-[10px] mt-1 font-bold">
                    {th ? "จะลบรูปนี้" : "Will remove"}
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
                  <Camera className="h-7 w-7 stroke-1.5" />
                  <span className="text-[10px] mt-1 font-semibold">
                    {th ? "ไม่มีรูป" : "No photo"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {th ? "รูปโปรไฟล์สมาชิก" : "Profile Photo"}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs">
                  <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>{th ? "เลือกรูปภาพ" : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {avatarUrl && !deleteAvatar && (
                  <button
                    type="button"
                    onClick={() => setDeleteAvatar(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{th ? "ลบรูปโปรไฟล์" : "Remove"}</span>
                  </button>
                )}

                {deleteAvatar && (
                  <button
                    type="button"
                    onClick={() => setDeleteAvatar(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{th ? "ยกเลิกการลบ" : "Restore"}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {th
                  ? "รองรับไฟล์ JPG, PNG, WEBP ไม่เกิน 5MB (ระบบปรับขนาดและบีบอัดให้อัตโนมัติ)"
                  : "Supports JPG, PNG, WEBP up to 5MB (auto-resized & optimized)"}
              </p>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* ── Work & Personal Details Grid (PDPA-safe) ── */}
          <div className="space-y-4">
            {/* Row 1: Member ID, Full Name, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "รหัสสมาชิก" : "Member ID"}
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value={currentUser?.member_id || (th ? "ไม่ระบุ" : "N/A")}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-600 dark:text-slate-300"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "ชื่อ - นามสกุล" : "Full Name"}{" "}
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
                      th ? "เช่น พว. สมศรี ใจดี" : "e.g. Dr. Somchai Jaidee"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "เพศ" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="ไม่ระบุ">{th ? "ไม่ระบุ" : "Not specified"}</option>
                  <option value="ชาย">{th ? "ชาย" : "Male"}</option>
                  <option value="หญิง">{th ? "หญิง" : "Female"}</option>
                </select>
              </div>
            </div>

            {/* Row 2: Position & Phone/Internal Ext */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "ตำแหน่งงาน" : "Job Position"}
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={100}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder={
                      th
                        ? "เช่น พยาบาลวิชาชีพชำนาญการ, นักวิชาการคอมพิวเตอร์"
                        : "e.g. Registered Nurse, IT Officer"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "เบอร์โทรศัพท์ / เบอร์ภายใน" : "Phone / Internal Ext."}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={
                      th
                        ? "เช่น 081-234-5678 หรือ ต่อ 1234"
                        : "e.g. 081-234-5678 or Ext. 1234"
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Department & Member Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "แผนก / หน่วยงาน" : "Department"}
                </label>
                {isDepartmentLocked ? (
                  <div>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                      <input
                        type="text"
                        value={th ? PENDING_DEPARTMENT : "Pending Approval"}
                        readOnly
                        disabled
                        className="w-full rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 cursor-not-allowed"
                      />
                      <Lock className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {th
                        ? "แผนกจะถูกกำหนดโดยผู้ดูแลระบบเมื่อบัญชีของคุณได้รับการอนุมัติ"
                        : "Assigned by an administrator once your account is approved"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                        <option value="อื่นๆ">
                          {th ? "อื่นๆ (ระบุเอง)" : "Other (Custom)"}
                        </option>
                      </select>
                    </div>

                    {department === "อื่นๆ" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customDepartment}
                          onChange={(e) => setCustomDepartment(e.target.value)}
                          placeholder={
                            th ? "ระบุชื่อแผนกของคุณ" : "Specify your department"
                          }
                          className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {th ? "สถานะสมาชิก" : "Member Role"}
                </label>
                <div className="relative">
                  <Star className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                  <select
                    value={role}
                    disabled={currentUser?.role !== "admin"}
                    onChange={(e) => setRole(e.target.value as "admin" | "user")}
                    className={`w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white ${
                      currentUser?.role !== "admin"
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    }`}
                  >
                    <option value="user">
                      {th ? "สมาชิก (บุคลากรทั่วไป)" : "Member (Staff)"}
                    </option>
                    <option value="admin">
                      {th ? "ผู้ดูแลระบบ (Admin)" : "Administrator (Admin)"}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Alerts */}
          {profileError && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 flex-none" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Save Profile Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e7d32] hover:bg-[#256629] text-white px-6 py-2.5 text-sm font-bold shadow-md shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? th
                    ? "กำลังบันทึก..."
                    : "Saving..."
                  : th
                    ? "บันทึกข้อมูลส่วนตัว"
                    : "Save Profile"}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── Card 3: Standalone Change Password Form ─── */}
      <form
        onSubmit={handleChangePassword}
        autoComplete="off"
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
              {th ? "เปลี่ยนรหัสผ่าน" : "Change Password"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {th
                ? "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร และแนะนำให้ผสมตัวอักษรกับตัวเลข"
                : "New password must be at least 6 characters"}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Old Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {th ? "รหัสผ่านเดิม" : "Current Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="profile-old-pwd"
                  autoComplete="new-password"
                  readOnly={!oldPwdEditable}
                  onFocus={() => setOldPwdEditable(true)}
                  onPointerDown={() => setOldPwdEditable(true)}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={th ? "กรอกรหัสผ่านเดิม" : "Current password"}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {th ? "รหัสผ่านใหม่" : "New Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="profile-new-pwd"
                  autoComplete="new-password"
                  readOnly={!newPwdEditable}
                  onFocus={() => setNewPwdEditable(true)}
                  onPointerDown={() => setNewPwdEditable(true)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    th ? "อย่างน้อย 6 ตัวอักษร" : "At least 6 characters"
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
              {newPassword.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          seg <= pwdStrength.level
                            ? pwdStrength.level === 1
                              ? "bg-rose-500"
                              : pwdStrength.level === 2
                                ? "bg-amber-500"
                                : pwdStrength.level === 3
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold ${pwdStrength.color}`}>
                    {pwdStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {th ? "ยืนยันรหัสผ่านใหม่" : "Confirm New Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="profile-confirm-pwd"
                  autoComplete="new-password"
                  readOnly={!confirmPwdEditable}
                  onFocus={() => setConfirmPwdEditable(true)}
                  onPointerDown={() => setConfirmPwdEditable(true)}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={th ? "พิมพ์รหัสผ่านใหม่อีกครั้ง" : "Re-enter new password"}
                  className={`w-full rounded-xl bg-slate-50 dark:bg-slate-800 border pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    passwordsMismatch
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                      : passwordsMatch
                        ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordsMatch && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{th ? "รหัสผ่านใหม่ตรงกัน" : "Passwords match"}</span>
                </p>
              )}
              {passwordsMismatch && (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{th ? "รหัสผ่านใหม่ไม่ตรงกัน" : "Passwords do not match"}</span>
                </p>
              )}
            </div>
          </div>

          {pwdError && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 flex-none" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={
                isChangingPassword ||
                !oldPassword ||
                newPassword.length < 6 ||
                newPassword !== confirmNewPassword
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-purple-600 dark:hover:bg-purple-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <KeyRound className="h-4 w-4" />
              <span>
                {isChangingPassword
                  ? th
                    ? "กำลังเปลี่ยนรหัสผ่าน..."
                    : "Changing password..."
                  : th
                    ? "ยืนยันการเปลี่ยนรหัสผ่าน"
                    : "Update Password"}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── Password Modal for Unlocking Email ─── */}
      {showEmailUnlockModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowEmailUnlockModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-5">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {th ? "ยืนยันตัวตนเพื่อเปลี่ยนอีเมล" : "Verify Identity"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {th
                  ? "กรุณากรอกรหัสผ่านปัจจุบันเพื่อปลดล็อกการแก้ไขอีเมล"
                  : "Enter your current password to unlock the email field."}
              </p>
            </div>

            <form onSubmit={handleVerifyUnlockEmail} autoComplete="off" className="space-y-4">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type={showUnlockPassword ? "text" : "password"}
                  name="unlock-email-pwd"
                  autoComplete="new-password"
                  readOnly={!unlockPwdEditable}
                  onFocus={() => setUnlockPwdEditable(true)}
                  onPointerDown={() => setUnlockPwdEditable(true)}
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder={th ? "รหัสผ่านปัจจุบันของคุณ" : "Your current password"}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showUnlockPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {unlockError && (
                <p className="text-xs font-bold text-rose-500 text-center">
                  {unlockError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailUnlockModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 text-sm font-bold transition-colors cursor-pointer"
                >
                  {th ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingUnlock || !unlockPassword}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2.5 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingUnlock
                    ? th
                      ? "กำลังตรวจ..."
                      : "Verifying..."
                    : th
                      ? "ยืนยัน"
                      : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileView
