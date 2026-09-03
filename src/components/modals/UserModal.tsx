import React, { useState } from "react"
import {
  X,
  UserPlus,
  AlertCircle,
  Building2,
  Phone,
  CreditCard,
  Home,
  MapPin,
  Image as ImageIcon,
} from "lucide-react"
import { User, Role } from "../../types"
import { useApp } from "../../context/AppContext"

interface UserModalProps {
  user?: User
  onClose: () => void
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

export const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const { t, language, handleSaveUser } = useApp()

  const [name, setName] = useState(user?.name || "")
  const [department, setDepartment] = useState(() => {
    const d = user?.department || "กลุ่มงานการพยาบาล"
    return DEPARTMENTS.includes(d) ? d : "อื่นๆ"
  })
  const [customDepartment, setCustomDepartment] = useState(() => {
    const d = user?.department || ""
    return DEPARTMENTS.includes(d) ? "" : d
  })
  const [role, setRole] = useState<Role>(user?.role || "user")
  const [gender, setGender] = useState(user?.gender || "ไม่ระบุ")
  const [citizenId, setCitizenId] = useState(user?.citizenId || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [province, setProvince] = useState(user?.province || "ปทุมธานี")
  const [zipcode, setZipcode] = useState(user?.zipcode || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")

  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError(language === "th" ? "ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB" : "Image size must be less than 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError(t.errFullName)
      return
    }
    if (!username.trim()) {
      setError(t.errUsername)
      return
    }
    if (!user && !password.trim()) {
      setError(t.errPasswordCreate)
      return
    }

    const finalDepartment =
      department === "อื่นๆ" ? customDepartment.trim() || "ทั่วไป" : department

    setIsSubmitting(true)
    try {
      await handleSaveUser({
        id: user?.id,
        name: name.trim(),
        department: finalDepartment,
        role,
        gender,
        citizenId: citizenId.trim(),
        phone: phone.trim(),
        address: address.trim(),
        province: province.trim(),
        zipcode: zipcode.trim(),
        avatarUrl,
        username: username.trim(),
        email: username.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      })
      onClose()
    } catch (err: any) {
      setError(
        err.message ||
          (language === "th"
            ? "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้"
            : "Failed to save user info"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user ? (language === "th" ? "แก้ไขข้อมูลผู้ใช้งาน" : "Edit User") : t.addUser}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "th"
                  ? "กำหนดสิทธิ์ แผนก และข้อมูลสมาชิก"
                  : "Assign role, department and details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
        >
          {/* Avatar Upload */}
          {!user && (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="h-14 w-14 flex-none rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <img
                src={avatarUrl || "/user.jpg"}
                alt="Avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                }}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                <span>{language === "th" ? "เปลี่ยนรูปโปรไฟล์" : "Change Avatar"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400">
                JPG, PNG ไม่เกิน 2MB
              </p>
            </div>
            </div>
          )}

          {/* Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={user ? "sm:col-span-3" : "sm:col-span-2"}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.fullName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  language === "th" ? "เช่น นพ. สมชาย ใจดี" : "e.g. Dr. Somchai Jaidee"
                }
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {!user && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  {language === "th" ? "เพศ" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="ไม่ระบุ">{language === "th" ? "ไม่ระบุ" : "Unspecified"}</option>
                  <option value="ชาย">{language === "th" ? "ชาย" : "Male"}</option>
                  <option value="หญิง">{language === "th" ? "หญิง" : "Female"}</option>
                </select>
              </div>
            )}
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.department}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="อื่นๆ">{language === "th" ? "อื่นๆ (ระบุเอง)" : "Other"}</option>
              </select>

              {department === "อื่นๆ" && (
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="ระบุแผนก"
                  className="mt-1.5 w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.role}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="user">{t.user}</option>
                <option value="admin">{t.admin}</option>
              </select>
            </div>
          </div>

          {!user && (
            <>
              {/* Citizen ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {language === "th" ? "เลขประจำตัวประชาชน" : "Citizen ID"}
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="เลข 13 หลัก"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {language === "th" ? "เบอร์โทรศัพท์" : "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  {language === "th" ? "ที่อยู่" : "Address"}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ที่อยู่จัดส่ง / ติดต่อ"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Province & Zipcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {language === "th" ? "จังหวัด" : "Province"}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {language === "th" ? "รหัสไปรษณีย์" : "Zipcode"}
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    placeholder="12160"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {t.username} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    {t.password}{" "}
                    {user ? (
                      <span className="text-slate-400 font-normal lowercase">
                        {t.leaveBlankToKeep}
                      </span>
                    ) : (
                      <span className="text-rose-500">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={user ? "••••••••" : t.passwordPlaceholder}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default UserModal
