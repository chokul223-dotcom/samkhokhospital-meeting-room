import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Language } from "../../types"
import { useApp } from "../../context/AppContext"

interface LanguageSwitcherProps {
  variant?: "floating" | "header" | "minimal"
}

const FlagImg: React.FC<{ code: string; size?: number }> = ({ code, size = 20 }) => (
  <img
    src={`https://flagcdn.com/w40/${code}.png`}
    alt={code}
    className="rounded-sm object-cover flex-none"
    style={{ width: size, height: Math.round(size * 0.75) }}
  />
)

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "floating",
}) => {
  const { language, setLanguage } = useApp()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options: {
    value: Language
    label: string
    flagCode: string
    countryCode: string
  }[] = [
    { value: "th", label: "ไทย (Thai)", flagCode: "th", countryCode: "TH" },
    { value: "en", label: "English (US)", flagCode: "us", countryCode: "EN" },
  ]

  const current = options.find((o) => o.value === language) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 md:gap-2 rounded-xl transition-all duration-200 ${
          variant === "floating"
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 md:px-3.5 py-1.5 md:py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-md hover:bg-white dark:hover:bg-slate-800"
            : "px-2.5 md:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
        }`}
      >
        <FlagImg code={current.flagCode} size={20} />
        <span className="hidden md:inline font-semibold">{current.countryCode}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 origin-top-right rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setLanguage(opt.value)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                language === opt.value
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FlagImg code={opt.flagCode} size={22} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
export default LanguageSwitcher
