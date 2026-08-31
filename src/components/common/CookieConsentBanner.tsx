import React, { useState, useEffect } from "react"
import {
  Cookie,
  Shield,
  Settings,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Lock,
  BarChart3,
  Wrench,
  ExternalLink,
  FileText,
} from "lucide-react"
import { useApp } from "../../context/AppContext"
import { CookieConsentPreferences } from "../../types"
import { PrivacyPolicyModal } from "../modals/PrivacyPolicyModal"

const STORAGE_KEY = "kcmh_cookie_consent"

const getDefaultPreferences = (): CookieConsentPreferences => ({
  necessary: true,
  functional: false,
  analytics: false,
  hasAnswered: false,
})

const loadPreferences = (): CookieConsentPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.hasAnswered) return parsed
    }
  } catch {}
  return getDefaultPreferences()
}

const savePreferences = (prefs: CookieConsentPreferences) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...prefs, updatedAt: new Date().toISOString() }),
  )
}

// ─── Cookie Settings Modal ──────────────────────────────────────────────────────

interface CookieSettingsModalProps {
  onClose: () => void
  onSave: (prefs: CookieConsentPreferences) => void
  initialPrefs: CookieConsentPreferences
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  onClose,
  onSave,
  initialPrefs,
}) => {
  const { language } = useApp()
  const [functional, setFunctional] = useState(initialPrefs.functional)
  const [analytics, setAnalytics] = useState(initialPrefs.analytics)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section)

  const handleSave = () => {
    onSave({
      necessary: true,
      functional,
      analytics,
      hasAnswered: true,
    })
  }

  const handleAcceptAll = () => {
    onSave({
      necessary: true,
      functional: true,
      analytics: true,
      hasAnswered: true,
    })
  }

  const categories = [
    {
      id: "necessary",
      icon: <Lock className="h-4 w-4" />,
      titleTh: "คุกกี้ที่จำเป็นอย่างยิ่ง",
      titleEn: "Strictly Necessary",
      descTh:
        "จำเป็นสำหรับการทำงานของระบบ เช่น สถานะเข้าสู่ระบบ การเลือกภาษา และธีม ไม่สามารถปิดได้",
      descEn:
        "Required for basic site functionality such as login session, language, and theme preferences. Cannot be disabled.",
      enabled: true,
      locked: true,
      onToggle: () => {},
    },
    {
      id: "functional",
      icon: <Wrench className="h-4 w-4" />,
      titleTh: "คุกกี้เพื่อการทำงาน",
      titleEn: "Functional Cookies",
      descTh:
        "จดจำค่าการตั้งค่า เช่น ห้องประชุมที่ดูล่าสุด การค้นหาที่เคยทำ หรือตัวกรองที่ชอบ",
      descEn:
        "Remembers your preferences like recently viewed rooms, searches, and preferred filters.",
      enabled: functional,
      locked: false,
      onToggle: () => setFunctional((p) => !p),
    },
    {
      id: "analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      titleTh: "คุกกี้เพื่อการวิเคราะห์",
      titleEn: "Analytics Cookies",
      descTh:
        "รวบรวมข้อมูลสถิติการใช้งานห้องประชุม จำนวนการเข้าชมหน้าต่างๆ เพื่อปรับปรุงระบบ",
      descEn:
        "Collects anonymous usage statistics on room bookings and page visits to improve the system.",
      enabled: analytics,
      locked: false,
      onToggle: () => setAnalytics((p) => !p),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold leading-tight">
                {language === "th"
                  ? "ตั้งค่าความยินยอมคุกกี้"
                  : "Cookie Preferences"}
              </h3>
              <p className="text-[11px] text-amber-100">
                {language === "th"
                  ? "เลือกประเภทคุกกี้ที่คุณยินยอม"
                  : "Choose which cookie types you allow"}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden"
            >
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                onClick={() => toggleSection(cat.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      cat.enabled
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {language === "th" ? cat.titleTh : cat.titleEn}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {cat.enabled
                        ? language === "th"
                          ? "เปิดใช้งาน"
                          : "Enabled"
                        : language === "th"
                          ? "ปิดใช้งาน"
                          : "Disabled"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!cat.locked) cat.onToggle()
                    }}
                    className={`transition-all ${cat.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={cat.locked}
                  >
                    {cat.enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                  {/* Expand chevron */}
                  {expandedSection === cat.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSection === cat.id && (
                <div className="px-4 pb-4 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  <p className="pt-3">
                    {language === "th" ? cat.descTh : cat.descEn}
                  </p>
                  {cat.locked && (
                    <p className="mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {language === "th"
                        ? "คุกกี้ประเภทนี้จำเป็นและไม่สามารถปิดได้"
                        : "This cookie type is required and cannot be disabled"}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {language === "th" ? "ยกเลิก" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            {language === "th" ? "บันทึกการตั้งค่า" : "Save Preferences"}
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {language === "th" ? "ยอมรับทั้งหมด" : "Accept All"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Cookie Consent Banner ─────────────────────────────────────────────────

export const CookieConsentBanner: React.FC = () => {
  const { language } = useApp()
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(
    getDefaultPreferences,
  )
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const saved = loadPreferences()
    setPreferences(saved)
    if (!saved.hasAnswered) {
      // Delay banner entrance slightly for a smooth UX
      const timer = setTimeout(() => setShowBanner(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissBanner = () => {
    setIsExiting(true)
    setTimeout(() => {
      setShowBanner(false)
      setIsExiting(false)
    }, 300)
  }

  const handleAcceptAll = () => {
    const newPrefs: CookieConsentPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      hasAnswered: true,
    }
    savePreferences(newPrefs)
    setPreferences(newPrefs)
    dismissBanner()
  }

  const handleRejectNonEssential = () => {
    const newPrefs: CookieConsentPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      hasAnswered: true,
    }
    savePreferences(newPrefs)
    setPreferences(newPrefs)
    dismissBanner()
  }

  const handleSaveSettings = (prefs: CookieConsentPreferences) => {
    savePreferences(prefs)
    setPreferences(prefs)
    setShowSettings(false)
    dismissBanner()
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  // Floating re-open button (always visible after consent answered)
  if (preferences.hasAnswered && !showBanner && !showSettings) {
    return (
      <button
        type="button"
        onClick={() => {
          setShowBanner(true)
          // Re-allow editing
          setPreferences((p) => ({ ...p, hasAnswered: false }))
        }}
        title={language === "th" ? "ตั้งค่าคุกกี้" : "Cookie Settings"}
        className="fixed bottom-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/30 text-amber-600 dark:text-amber-400 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
      >
        <Cookie className="h-5 w-5 group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  if (!showBanner && !showSettings) return null

  return (
    <>
      {/* ─── Banner ─── */}
      {showBanner && !showSettings && (
        <div
          className={`fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5 transition-all duration-300 ${
            isExiting
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100 animate-in slide-in-from-bottom duration-500"
          }`}
        >
          <div className="max-w-3xl mx-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl shadow-slate-900/20 dark:shadow-black/40 overflow-hidden">
            {/* Top Decorative Bar */}
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

            <div className="p-5 sm:p-6">
              {/* Title Row */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-none flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {language === "th"
                      ? "🍪 เราใช้คุกกี้เพื่อพัฒนาประสบการณ์ของคุณ"
                      : "🍪 We use cookies to enhance your experience"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === "th"
                      ? "เว็บไซต์ระบบจองห้องประชุม รพ.สามโคก ใช้คุกกี้เพื่อให้ระบบทำงานได้อย่างถูกต้อง และเพื่อวิเคราะห์การใช้งานเพื่อปรับปรุงประสบการณ์ของคุณ คุณสามารถเลือกยอมรับหรือปฏิเสธคุกกี้ที่ไม่จำเป็นได้"
                      : "Samkhok Hospital Meeting Room Booking uses cookies for essential site functionality and to analyze usage for improving your experience. You can accept or reject non-essential cookies."}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    onClick={() => setShowPrivacy(true)}
                  >
                    <Shield className="h-3 w-3" />
                    {language === "th"
                      ? "อ่านนโยบายความเป็นส่วนตัว"
                      : "Read Privacy Policy"}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  {language === "th" ? "ยอมรับทั้งหมด" : "Accept All"}
                </button>

                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  {language === "th"
                    ? "ปฏิเสธที่ไม่จำเป็น"
                    : "Reject Non-Essential"}
                </button>

                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {language === "th" ? "ตั้งค่าคุกกี้" : "Cookie Settings"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Settings Modal ─── */}
      {showSettings && (
        <CookieSettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialPrefs={preferences}
        />
      )}

      {/* ─── Privacy Policy Modal ─── */}
      {showPrivacy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />
      )}
    </>
  )
}

export default CookieConsentBanner
