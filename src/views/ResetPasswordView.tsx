import React, { useState, useEffect } from "react"
import { KeyRound, Eye, EyeOff, CheckCircle, XCircle, Loader2, Lock, ShieldAlert } from "lucide-react"
import * as api from "../services/api"

interface ResetPasswordViewProps {
  token: string
  onDone: () => void
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onDone }) => {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenInfo, setTokenInfo] = useState<{ valid: boolean; name?: string; username?: string } | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verify = async () => {
      try {
        const info = await api.verifyResetToken(token)
        setTokenInfo(info)
      } catch {
        setTokenInfo({ valid: false })
      } finally {
        setVerifying(false)
      }
    }
    verify()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }
    if (password !== confirm) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน")
      return
    }

    setLoading(true)
    try {
      await api.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => onDone(), 3000)
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-12 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20 dark:border-slate-800 p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-1 shadow-lg shadow-blue-600/25">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain rounded-xl bg-white p-1" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">โรงพยาบาลสามโคก</p>
        </div>

        {verifying ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-500">กำลังตรวจสอบลิงก์...</p>
          </div>
        ) : !tokenInfo?.valid ? (
          /* Invalid / Expired Token */
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 mb-4">
              <XCircle className="h-8 w-8 text-rose-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้แล้วหรือหมดอายุแล้ว<br />
              กรุณาติดต่อผู้ดูแลระบบเพื่อขอลิงก์ใหม่
            </p>
            <button
              onClick={onDone}
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              กลับหน้าเข้าสู่ระบบ
            </button>
          </div>
        ) : success ? (
          /* Success */
          <div className="text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">รีเซ็ตรหัสผ่านสำเร็จ!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              กำลังพาคุณไปหน้าเข้าสู่ระบบ...
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500 mx-auto" />
          </div>
        ) : (
          /* Reset Form */
          <>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white text-center mb-1 flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              ตั้งรหัสผ่านใหม่
            </h2>
            {tokenInfo.name && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-5">
                สำหรับบัญชี <span className="font-bold text-blue-600 dark:text-blue-400">{tokenInfo.name}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                  required
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  required
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength hint */}
              {password && (
                <div className="flex gap-1 px-1">
                  {[6, 8, 12].map((len, i) => (
                    <div
                      key={len}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= len
                          ? i === 0 ? "bg-rose-400" : i === 1 ? "bg-amber-400" : "bg-emerald-400"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">
                    {password.length < 6 ? "สั้นเกินไป" : password.length < 8 ? "พอใช้" : password.length < 12 ? "ดี" : "แข็งแกร่ง"}
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                <span>{loading ? "กำลังบันทึก..." : "ยืนยันรหัสผ่านใหม่"}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordView
