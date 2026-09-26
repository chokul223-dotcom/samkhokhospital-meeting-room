import React, { useState, useEffect } from "react"
import { CheckCircle2, X, PartyPopper } from "lucide-react"

interface ApprovalBannerProps {
  onDismiss: () => void
  language?: "th" | "en"
}

/**
 * ApprovalBanner — แสดงเมื่อแอดมินอนุมัติบัญชีผู้ใช้ใหม่
 * Real-time banner ที่ค้างอยู่จนผู้ใช้กด dismiss เอง
 */
export const ApprovalBanner: React.FC<ApprovalBannerProps> = ({ onDismiss, language = "th" }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300) // wait for fade-out animation
  }

  return (
    <div
      className={`fixed inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto sm:w-[420px] top-20 z-[100]
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-emerald-200/60 dark:border-emerald-700/50
        bg-gradient-to-br from-emerald-50 via-white to-teal-50
        dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-teal-950/90
        backdrop-blur-xl">

        {/* Accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

        {/* Animated background shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_1_0.3s]
          bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-none mt-0.5">
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500
                shadow-lg flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-white" />
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-2xl ring-4 ring-emerald-400/30 animate-ping" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PartyPopper className="h-4 w-4 text-amber-500 flex-none" />
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {language === "th" ? "บัญชีได้รับการอนุมัติ" : "Account Approved"}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">
                {language === "th"
                  ? "🎉 ยินดีด้วย! คุณสามารถใช้งานระบบได้แล้ว"
                  : "🎉 Congratulations! Your account is now active."}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === "th"
                  ? "ผู้ดูแลระบบได้อนุมัติบัญชีของคุณเรียบร้อยแล้ว คุณสามารถจองห้องประชุมและใช้งานฟีเจอร์ทั้งหมดได้ทันที"
                  : "The administrator has approved your account. You can now book meeting rooms and access all features."}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-none p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
                hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh hint */}
          <div className="mt-3 ml-16 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] font-medium text-emerald-600/70 dark:text-emerald-400/70">
              {language === "th" ? "ข้อมูลโปรไฟล์อัปเดตอัตโนมัติแล้ว" : "Profile data automatically refreshed"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApprovalBanner
