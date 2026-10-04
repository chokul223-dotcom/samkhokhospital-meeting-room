import React from "react"
import { Globe, Moon, Sun, Info, Check } from "lucide-react"
import { Language, ThemeOption } from "../types"
import { useApp } from "../context/AppContext"

export const SettingsView: React.FC = () => {
  const { t, language, setLanguage, theme, setTheme } = useApp()

  const langOptions: {
    value: Language
    label: string
    sub: string
    flag: string
  }[] = [
    { value: "th", label: "ภาษาไทย", sub: "Thai Language", flag: "🇹🇭" },
    {
      value: "en",
      label: "English (US)",
      sub: "English (United States)",
      flag: "🇺🇸",
    },
  ]

  const themeOptions: { value: ThemeOption; label: string; icon: any }[] = [
    { value: "light", label: t.lightTheme, icon: Sun },
    { value: "dark", label: t.darkTheme, icon: Moon },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-10">
      {/* 1. Settings Unified Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Language Section */}
        <div>
          <div className="px-6 py-4 flex items-center gap-2.5 mt-2">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.language}
            </h3>
          </div>

          <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {langOptions.map((opt) => {
              const isSelected = language === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={`flex items-center justify-between rounded-2xl p-4 border transition-all text-left ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                      : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{opt.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.sub}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Theme Section */}
        <div>
          <div className="px-6 py-4 flex items-center gap-2.5">
            <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.theme}
            </h3>
          </div>

          <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center justify-between rounded-2xl p-4 border transition-all text-left ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                      : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.value === "light"
                          ? t.lightThemeDesc
                          : t.darkThemeDesc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Hospital System Info Section */}
        <div>
          <div className="px-6 py-4 flex items-center gap-2.5">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.hospitalInfo}
            </h3>
          </div>

          <div className="px-6 pb-8 pt-2 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 p-4 border border-blue-100 dark:border-blue-900/40">
              <img
                src="/logo.png"
                alt="Hospital Logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {t.appName}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {t.developerInfo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.systemVersion}
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  v2.0.0 (Modern Edition)
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Real-time Engine
                </span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active (SSE Connected)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SettingsView
