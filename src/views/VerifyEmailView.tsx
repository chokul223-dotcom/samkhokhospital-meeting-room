import React, { useState, useEffect } from "react"
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react"
import * as api from "../services/api"

interface VerifyEmailViewProps {
  token: string
  onDone: () => void
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ token, onDone }) => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("กำลังตรวจสอบลิงก์...")

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.verifyEmail(token)
        setStatus("success")
        setMessage(res.message || "ยืนยันอีเมลสำเร็จ")
        setTimeout(() => onDone(), 3000)
      } catch (err: any) {
        setStatus("error")
        setMessage(err.message || "ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว")
      }
    }
    verify()
  }, [token, onDone])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20 dark:border-slate-800 p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-blue-500" />}
          {status === "success" && <CheckCircle className="h-8 w-8 text-emerald-500" />}
          {status === "error" && <XCircle className="h-8 w-8 text-rose-500" />}
        </div>
        
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {status === "loading" && "กำลังตรวจสอบ..."}
          {status === "success" && "ยืนยันอีเมลสำเร็จ!"}
          {status === "error" && "เกิดข้อผิดพลาด"}
        </h2>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {message}
        </p>
        
        {status !== "loading" && (
          <button
            onClick={onDone}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-blue-600/30"
          >
            ดำเนินการต่อ
          </button>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailView
