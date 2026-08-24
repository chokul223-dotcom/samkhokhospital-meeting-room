import React from "react"
import { Sun, Moon } from "lucide-react"
import { useApp } from "../../context/AppContext"

interface ThemeToggleProps {
  variant?: "floating" | "inline"
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "floating",
}) => {
  const { theme, setTheme, language } = useApp()
  const isDark = theme === "dark"

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700" />
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-3.5 py-2.5 shadow-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 select-none ${
        isDark
          ? "bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/40"
          : "bg-white/95 border-slate-200/80 text-slate-800 shadow-blue-900/10"
      }`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          isDark
            ? "bg-indigo-950 text-amber-300"
            : "bg-amber-100 text-amber-600"
        }`}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </div>
      <span className="text-xs font-bold tracking-wide pr-1">
        {isDark
          ? language === "th"
            ? "โหมดมืด"
            : "DARK"
          : language === "th"
            ? "โหมดสว่าง"
            : "LIGHT"}
      </span>
    </button>
  )
}
export default ThemeToggle
