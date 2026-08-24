import React, { useState } from "react"
import { X, UserPlus, UserCheck, Shield, Key, AlertCircle } from "lucide-react"
import { User, Role } from "../../types"
import { useApp } from "../../context/AppContext"

interface UserModalProps {
  user?: User
  onClose: () => void
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const { t, handleSaveUser } = useApp()

  const [name, setName] = useState(user?.name || "")
  const [department, setDepartment] = useState(user?.department || "")
  const [role, setRole] = useState<Role>(user?.role || "user")
  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    setIsSubmitting(true)
    try {
      await handleSaveUser({
        id: user?.id,
        name: name.trim(),
        department: department.trim() || "-",
        role,
        username: username.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user ? t.editUser : t.addUser}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                บุคลากรโรงพยาบาลสามโคก
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
              {t.fullName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นพ. สมชาย ใจดี"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.department}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น กลุ่มงานพยาบาล"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.role}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="user">{t.user}</option>
                <option value="admin">{t.admin}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.username} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username สำหรับเข้าสู่ระบบ"
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.password}{" "}
              {user ? (
                <span className="text-slate-400 font-normal lowercase">
                  {t.leaveBlankToKeep}
                </span>
              ) : (
                <span className="text-rose-500">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={user ? "••••••••" : "ระบุรหัสผ่าน"}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Key className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
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
export default UserModal
