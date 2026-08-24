import React, { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { useApp } from "../../context/AppContext"

interface RejectModalProps {
  bookingId: string
  onClose: () => void
}

export const RejectModal: React.FC<RejectModalProps> = ({
  bookingId,
  onClose,
}) => {
  const { t, handleReject } = useApp()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await handleReject(bookingId, reason.trim())
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.confirmRejectTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ระบุเหตุผลในการไม่อนุมัติคำขอ
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.rejectReason}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.rejectReasonPlaceholder}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-all disabled:opacity-50"
            >
              {t.rejectBooking}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default RejectModal
