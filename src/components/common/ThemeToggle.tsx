import React from "react"
import { useApp } from "../../context/AppContext"

interface ThemeToggleProps {
  variant?: "floating" | "inline"
  className?: string
}

const DayIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-xs select-none pointer-events-none">
    {/* Sky Circle Background */}
    <circle cx="50" cy="50" r="50" fill="#bfe8f6" />
    {/* Sun Rays */}
    <g fill="#ff5722">
      <polygon
        points="50,8 59,28 80,18 73,39 94,50 73,61 80,82 59,72 50,92 41,72 20,82 27,61 6,50 27,39 20,18 41,28"
        fill="#ff7043"
      />
    </g>
    {/* Sun Body */}
    <circle cx="50" cy="50" r="22" fill="#ffca28" stroke="#ffa726" strokeWidth="2" />
    {/* White Cloud */}
    <path
      d="M50 78 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -24 -6 a11 11 0 0 0 -10 11 a10 10 0 0 0 6 15 z"
      fill="#ffffff"
      opacity="0.95"
    />
  </svg>
)

const NightIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-xs select-none pointer-events-none">
    {/* Night Sky Circle */}
    <circle cx="50" cy="50" r="50" fill="#1b3a53" />
    {/* Stars */}
    <circle cx="74" cy="24" r="2.5" fill="#ffffff" />
    <circle cx="86" cy="46" r="2" fill="#ffffff" />
    <circle cx="70" cy="82" r="2" fill="#ffffff" />
    <circle cx="28" cy="22" r="1.5" fill="#ffffff" />
    {/* Crescent Moon */}
    <path
      d="M58 20 A 30 30 0 1 0 58 80 A 23 23 0 1 1 58 20 Z"
      fill="#ffffff"
    />
    {/* Night Cloud */}
    <path
      d="M48 78 h34 a10 10 0 0 0 0 -20 a14 14 0 0 0 -24 -6 a11 11 0 0 0 -16 11 a10 10 0 0 0 6 15 z"
      fill="#315570"
      opacity="0.95"
    />
  </svg>
)

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "floating",
  className = "",
}) => {
  const { theme, setTheme } = useApp()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // Floating variant (e.g. bottom-right corner)
  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? "เปลี่ยนเป็นโหมดสว่าง (Light Mode)" : "เปลี่ยนเป็นโหมดมืด (Dark Mode)"}
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-between w-[142px] h-[40px] px-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none ${
          isDark
            ? "bg-slate-900 border-slate-700 text-white shadow-slate-950/60"
            : "bg-white border-slate-300 text-slate-900 shadow-blue-900/15"
        } ${className}`}
      >
        {isDark ? (
          <>
            <span className="text-[11px] font-black tracking-wider uppercase pl-3 text-slate-100">
              DARK MODE
            </span>
            <div className="h-[30px] w-[30px] flex-none rounded-full overflow-hidden shadow-inner">
              <NightIcon />
            </div>
          </>
        ) : (
          <>
            <div className="h-[30px] w-[30px] flex-none rounded-full overflow-hidden shadow-inner">
              <DayIcon />
            </div>
            <span className="text-[11px] font-black tracking-wider uppercase pr-3 text-slate-800">
              LIGHT MODE
            </span>
          </>
        )}
      </button>
    )
  }

  // Inline variant (e.g. top header navbar)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "เปลี่ยนเป็นโหมดสว่าง (Light Mode)" : "เปลี่ยนเป็นโหมดมืด (Dark Mode)"}
      className={`relative flex items-center justify-between w-[138px] h-[38px] px-1.5 rounded-full border shadow-sm transition-all duration-300 hover:shadow-md active:scale-95 cursor-pointer select-none ${
        isDark
          ? "bg-slate-900/95 border-slate-700 text-white hover:border-slate-600"
          : "bg-white/95 border-slate-300 text-slate-900 hover:border-slate-400"
      } ${className}`}
    >
      {isDark ? (
        <>
          <span className="text-[11px] font-black tracking-wider uppercase pl-3 text-slate-100">
            DARK MODE
          </span>
          <div className="h-[28px] w-[28px] flex-none rounded-full overflow-hidden shadow-xs">
            <NightIcon />
          </div>
        </>
      ) : (
        <>
          <div className="h-[28px] w-[28px] flex-none rounded-full overflow-hidden shadow-xs">
            <DayIcon />
          </div>
          <span className="text-[11px] font-black tracking-wider uppercase pr-3 text-slate-800">
            LIGHT MODE
          </span>
        </>
      )}
    </button>
  )
}
export default ThemeToggle
