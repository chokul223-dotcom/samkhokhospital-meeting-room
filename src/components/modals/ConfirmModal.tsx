import React from "react"
import { AlertTriangle, X } from "lucide-react"
import { useApp } from "../../context/AppContext"

interface ConfirmModalProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  const { t } = useApp()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
            isDestructive
              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
              : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          }`}
        >
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelText || t.cancelBtn}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
            }`}
          >
            {confirmText || "ยืนยัน"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmModal
