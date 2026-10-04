import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ClipboardCheck,
  Send,
  MessageSquareText,
  ChartColumn,
  CircleCheck,
  ArrowLeft,
  Users,
  TrendingUp,
  LoaderCircle,
  Sparkles,
  Quote,
  RotateCcw,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import * as api from "../services/api"
import { EvaluationSummary } from "../types"
import {
  EVALUATION_SECTIONS,
  ALL_EVALUATION_QUESTIONS,
  RATING_LEVELS,
  interpretAverage,
} from "../constants/evaluation"

const MAX_SUGGESTION = 2000

type Mode = "form" | "results"

// ═══════════════════════════════════════════════════════════════════════════
// Main view
// ═══════════════════════════════════════════════════════════════════════════
export const EvaluationView: React.FC = () => {
  const { language, currentUser } = useApp()
  const isTh = language === "th"
  const isAdmin = currentUser?.role === "admin"
  const [mode, setMode] = useState<Mode>("form")

  return (
    <div className="max-w-5xl mx-auto space-y-5 eval-fade-up">
      {/* ── Page Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0738] via-[#3b1170] to-[#6d28d9] text-white shadow-xl shadow-purple-900/20">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />

        <div className="relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur animate-float-subtle">
            <ClipboardCheck className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-200/90">
              {isTh ? "แบบประเมิน" : "Survey"}
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-bold leading-tight">
              {isTh ? "ประเมินความพึงพอใจการใช้ระบบ" : "System Satisfaction Survey"}
            </h1>
            <p className="mt-1 text-sm text-purple-100/80">
              {isTh
                ? "ระบบจองห้องประชุม โรงพยาบาลสามโคก — ใช้เวลาไม่ถึง 1 นาที"
                : "Samkhok Hospital Meeting Room Booking — takes less than a minute"}
            </p>
          </div>

          {isAdmin && (
            <div className="flex rounded-2xl bg-white/10 p-1 ring-1 ring-white/15 self-start sm:self-center">
              <button
                id="eval-tab-form"
                onClick={() => setMode("form")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  mode === "form" ? "bg-white text-purple-900 shadow" : "text-purple-100 hover:bg-white/10"
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                {isTh ? "แบบประเมิน" : "Survey"}
              </button>
              <button
                id="eval-tab-results"
                onClick={() => setMode("results")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  mode === "results" ? "bg-white text-purple-900 shadow" : "text-purple-100 hover:bg-white/10"
                }`}
              >
                <ChartColumn className="h-4 w-4" />
                {isTh ? "ผลการประเมิน" : "Results"}
              </button>
            </div>
          )}
        </div>
      </section>

      {mode === "results" && isAdmin ? <EvaluationResults /> : <EvaluationForm />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Survey form
// ═══════════════════════════════════════════════════════════════════════════
const EvaluationForm: React.FC = () => {
  const { language, showToast } = useApp()
  const navigate = useNavigate()
  const isTh = language === "th"

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [suggestion, setSuggestion] = useState("")
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const total = ALL_EVALUATION_QUESTIONS.length
  const answeredCount = ALL_EVALUATION_QUESTIONS.filter((q) => answers[q.id]).length
  const progress = Math.round((answeredCount / total) * 100)
  const allAnswered = answeredCount === total

  const handleSelect = (qid: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: score }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allAnswered) {
      setShowErrors(true)
      const firstMissing = ALL_EVALUATION_QUESTIONS.find((q) => !answers[q.id])
      if (firstMissing) {
        rowRefs.current[firstMissing.id]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      showToast(isTh ? "กรุณาให้คะแนนให้ครบทุกข้อ" : "Please rate every question")
      return
    }

    setSubmitting(true)
    try {
      await api.submitEvaluation({ answers, suggestion: suggestion.trim() || undefined })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      showToast(
        (isTh ? "ส่งแบบประเมินไม่สำเร็จ: " : "Failed to submit: ") + (err?.message || "Error"),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setSuggestion("")
    setShowErrors(false)
    setSubmitted(false)
  }

  if (submitted) {
    return <ThankYouCard onHome={() => navigate("/")} onAgain={handleReset} />
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
    >
      {/* ── Progress ─────────────────────────────────────────────────── */}
      {/* NOTE: parent must NOT have overflow-hidden, otherwise sticky is offset inside the card */}
      <div className="sticky top-14 z-10 rounded-t-3xl px-5 sm:px-7 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-[0_6px_12px_-10px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            {isTh ? "ความคืบหน้า" : "Progress"}
          </span>
          <span className={allAnswered ? "text-emerald-600 dark:text-emerald-400" : "text-purple-700 dark:text-purple-300"}>
            {isTh ? `ตอบแล้ว ${answeredCount}/${total} ข้อ` : `${answeredCount}/${total} answered`}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              allAnswered
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-fuchsia-500 to-purple-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-7 space-y-6">
        {/* ── Rating scale legend (desktop column headers) ──────────────── */}
        <div className="hidden md:grid grid-cols-[1fr_repeat(5,6.25rem)] items-end gap-1 px-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isTh ? "ประเด็นคำถาม" : "Questions"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTh ? "เลือกระดับความพึงพอใจของท่านในแต่ละข้อ" : "Select your satisfaction level for each item"}
            </p>
          </div>
          {RATING_LEVELS.map((lv) => (
            <div key={lv.score} className="text-center">
              <div className="text-2xl leading-none">{lv.emoji}</div>
              <p className="mt-1.5 text-[11px] font-bold leading-tight text-slate-700 dark:text-slate-200">
                {isTh ? lv.th : lv.en}
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                {lv.score} {isTh ? "คะแนน" : lv.score > 1 ? "pts" : "pt"}
              </p>
            </div>
          ))}
        </div>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        {EVALUATION_SECTIONS.map((section, sIdx) => (
          <fieldset key={section.id} className="space-y-2">
            <legend className="w-full">
              <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/50 dark:to-fuchsia-950/30 border border-purple-100 dark:border-purple-900/50 px-4 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-600 text-[11px] font-bold text-white">
                  {sIdx + 1}
                </span>
                <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                  {isTh ? section.th : section.en}
                </span>
              </div>
            </legend>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {section.questions.map((q, qIdx) => {
                const selected = answers[q.id]
                const missing = showErrors && !selected
                const selectedLevel = RATING_LEVELS.find((l) => l.score === selected)
                return (
                  <div
                    key={q.id}
                    ref={(el) => {
                      rowRefs.current[q.id] = el
                    }}
                    role="radiogroup"
                    aria-labelledby={`${q.id}-label`}
                    className={`grid grid-cols-1 md:grid-cols-[1fr_repeat(5,6.25rem)] items-center gap-3 md:gap-1 rounded-2xl px-4 py-4 md:py-3 transition-colors ${
                      missing
                        ? "bg-rose-50/80 dark:bg-rose-950/30 ring-1 ring-rose-300 dark:ring-rose-800 eval-shake"
                        : selected
                          ? "bg-transparent"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 min-w-6 flex-none items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-colors ${
                          selected
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {selected ? <CircleCheck className="h-3.5 w-3.5" /> : `${sIdx + 1}.${qIdx + 1}`}
                      </span>
                      <div>
                        <p id={`${q.id}-label`} className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {isTh ? q.th : q.en}
                        </p>
                        {/* mobile: show chosen level */}
                        <p className="md:hidden mt-0.5 text-xs h-4">
                          {selectedLevel ? (
                            <span className="font-semibold text-purple-700 dark:text-purple-300">
                              {selectedLevel.emoji} {isTh ? selectedLevel.th : selectedLevel.en}
                            </span>
                          ) : missing ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              {isTh ? "กรุณาเลือกคะแนน" : "Please select a rating"}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {/* rating options */}
                    <div className="grid grid-cols-5 gap-2 md:contents">
                      {RATING_LEVELS.map((lv) => {
                        const isOn = selected === lv.score
                        return (
                          <label
                            key={lv.score}
                            title={isTh ? lv.th : lv.en}
                            className="flex justify-center cursor-pointer group"
                          >
                            <input
                              id={`${q.id}-${lv.score}`}
                              type="radio"
                              name={q.id}
                              value={lv.score}
                              checked={isOn}
                              onChange={() => handleSelect(q.id, lv.score)}
                              className="sr-only peer"
                            />
                            {/* desktop: round radio */}
                            <span
                              className={`hidden md:flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-purple-500/30 ${
                                isOn
                                  ? `${lv.active} scale-110 shadow-lg eval-pop`
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-purple-400 group-hover:scale-105"
                              }`}
                            >
                              {isOn ? (
                                <span className="text-base leading-none">{lv.emoji}</span>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-purple-500">
                                  {lv.score}
                                </span>
                              )}
                            </span>
                            {/* mobile: tile */}
                            <span
                              className={`md:hidden flex w-full flex-col items-center gap-0.5 rounded-xl border-2 py-2 transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-purple-500/30 ${
                                isOn
                                  ? `${lv.active} shadow-md eval-pop`
                                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
                              }`}
                            >
                              <span className="text-lg leading-none">{lv.emoji}</span>
                              <span className="text-[11px] font-bold">{lv.score}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </fieldset>
        ))}

        {/* ── Suggestion ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/50 dark:to-fuchsia-950/30 border border-purple-100 dark:border-purple-900/50 px-4 py-2.5">
            <MessageSquareText className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            <label htmlFor="eval-suggestion" className="text-sm font-bold text-purple-900 dark:text-purple-200">
              {isTh ? "ข้อเสนอแนะ สำหรับการนำไปใช้พัฒนาระบบ" : "Suggestions for improving the system"}
              <span className="ml-1.5 font-normal text-purple-500/80 dark:text-purple-400/70">
                ({isTh ? "ไม่บังคับ" : "optional"})
              </span>
            </label>
          </div>
          <div className="relative">
            <textarea
              id="eval-suggestion"
              rows={4}
              maxLength={MAX_SUGGESTION}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder={
                isTh
                  ? "เช่น อยากให้เพิ่มการแจ้งเตือนก่อนเวลาประชุม, ปรับหน้าจอให้ใช้งานบนมือถือได้ง่ายขึ้น..."
                  : "e.g. Add reminders before meetings, improve the mobile layout..."
              }
              className="w-full resize-y rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 px-4 py-3 pb-7 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-purple-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-purple-500/15"
            />
            <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-slate-400">
              {suggestion.length}/{MAX_SUGGESTION}
            </span>
          </div>
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            id="eval-submit"
            type="submit"
            disabled={submitting}
            className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-8 py-3 text-base font-bold text-white shadow-lg transition-all cursor-pointer disabled:cursor-wait ${
              allAnswered
                ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 active:translate-y-0"
                : "bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-600 shadow-slate-400/20"
            }`}
          >
            {allAnswered && (
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/25 eval-shimmer" />
            )}
            {submitting ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
            <span>{submitting ? (isTh ? "กำลังส่ง..." : "Submitting...") : isTh ? "ส่งประเมิน" : "Submit"}</span>
          </button>
          {!allAnswered && (
            <p className="text-xs text-slate-400">
              {isTh
                ? `เหลืออีก ${total - answeredCount} ข้อที่ยังไม่ได้ให้คะแนน`
                : `${total - answeredCount} question(s) left to rate`}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Thank-you card
// ═══════════════════════════════════════════════════════════════════════════
const ThankYouCard: React.FC<{ onHome: () => void; onAgain: () => void }> = ({ onHome, onAgain }) => {
  const { language } = useApp()
  const isTh = language === "th"

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm px-6 py-12 sm:py-14 text-center eval-fade-up">
      <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-56 rounded-full bg-emerald-300/30 dark:bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 eval-ping-once" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 eval-pop">
          <CircleCheck className="h-10 w-10" strokeWidth={2.4} />
        </span>
        <Sparkles className="absolute -right-3 -top-1 h-5 w-5 text-amber-400 animate-sparkle" />
        <Sparkles className="absolute -left-4 bottom-0 h-4 w-4 text-fuchsia-400 animate-sparkle [animation-delay:1.2s]" />
      </div>

      <h2 className="relative mt-6 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        {isTh ? "ขอบคุณสำหรับความคิดเห็น" : "Thank you for your feedback"}
      </h2>
      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
      <p className="relative mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {isTh
          ? "ขอบคุณสำหรับการมีส่วนร่วมของท่านในการประเมินความพึงพอใจนี้ ความคิดเห็นของท่านมีค่าอันมากสำหรับเรา และจะช่วยให้เราพัฒนาและปรับปรุงบริการของเราให้ดียิ่งขึ้นต่อไป"
          : "Thank you for taking part in this satisfaction survey. Your feedback is invaluable and will help us develop and improve our service even further."}
      </p>

      <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="eval-back-home"
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {isTh ? "กลับหน้าแรก" : "Back to Home"}
        </button>
        <button
          id="eval-again"
          onClick={onAgain}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          {isTh ? "ทำแบบประเมินอีกครั้ง" : "Submit another response"}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Admin results dashboard
// ═══════════════════════════════════════════════════════════════════════════
const EvaluationResults: React.FC = () => {
  const { language } = useApp()
  const isTh = language === "th"
  const [data, setData] = useState<EvaluationSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await api.fetchEvaluationSummary())
    } catch (err: any) {
      setError(err?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const overall = useMemo(() => {
    if (!data) return 0
    const avgs = ALL_EVALUATION_QUESTIONS.map((q) => data.questions[q.id]?.average || 0).filter(Boolean)
    return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0
  }, [data])

  const overallLevel = interpretAverage(overall)

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-20 text-sm text-slate-500">
        <LoaderCircle className="h-5 w-5 animate-spin text-purple-600" />
        {isTh ? "กำลังโหลดผลการประเมิน..." : "Loading results..."}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 py-14 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {isTh ? "ไม่สามารถโหลดผลการประเมินได้" : "Could not load results"}: {error}
        </p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isTh ? "ลองใหม่" : "Retry"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 eval-fade-up">
      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          icon={<Users className="h-5 w-5" />}
          tone="from-purple-500 to-indigo-600"
          label={isTh ? "จำนวนผู้ตอบ" : "Responses"}
          value={data.total.toLocaleString()}
          sub={isTh ? "คน" : "people"}
        />
        <StatTile
          icon={<TrendingUp className="h-5 w-5" />}
          tone="from-emerald-500 to-teal-600"
          label={isTh ? "คะแนนเฉลี่ยรวม" : "Overall Average"}
          value={overall ? overall.toFixed(2) : "-"}
          sub={overallLevel ? `${overallLevel.emoji} ${isTh ? overallLevel.th : overallLevel.en}` : "/ 5.00"}
        />
        <StatTile
          icon={<MessageSquareText className="h-5 w-5" />}
          tone="from-fuchsia-500 to-pink-600"
          label={isTh ? "ข้อเสนอแนะ" : "Suggestions"}
          value={data.suggestions.length.toLocaleString()}
          sub={isTh ? "รายการล่าสุด" : "latest"}
        />
      </div>

      {/* ── Per-question breakdown ───────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ChartColumn className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            {isTh ? "ผลการประเมินรายข้อ" : "Results by Question"}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {RATING_LEVELS.map((lv) => (
              <span key={lv.score} className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className={`h-2.5 w-2.5 rounded-full ${lv.dot}`} />
                {lv.score}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {EVALUATION_SECTIONS.map((section, sIdx) => (
            <div key={section.id} className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                {sIdx + 1}. {isTh ? section.th : section.en}
              </p>
              {section.questions.map((q, qIdx) => {
                const stat = data.questions[q.id]
                const count = stat?.count || 0
                const level = interpretAverage(stat?.average || 0)
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 hover:border-purple-200 dark:hover:border-purple-900 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="mr-1.5 text-slate-400">
                          {sIdx + 1}.{qIdx + 1}
                        </span>
                        {isTh ? q.th : q.en}
                      </p>
                      <div className="text-right flex-none">
                        <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                          {stat?.average ? stat.average.toFixed(2) : "-"}
                        </p>
                        {level && (
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {level.emoji} {isTh ? level.th : level.en}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* stacked distribution bar */}
                    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      {count > 0 &&
                        RATING_LEVELS.map((lv) => {
                          const n = stat.distribution[lv.score] || 0
                          if (!n) return null
                          return (
                            <div
                              key={lv.score}
                              title={`${isTh ? lv.th : lv.en}: ${n}`}
                              className={`${lv.dot} h-full transition-all duration-700`}
                              style={{ width: `${(n / count) * 100}%` }}
                            />
                          )
                        })}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {RATING_LEVELS.map((lv) => (
                        <span key={lv.score}>
                          {lv.emoji} {stat?.distribution[lv.score] || 0}
                        </span>
                      ))}
                      <span className="ml-auto">
                        n = {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Suggestions ──────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <MessageSquareText className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
            {isTh ? "ข้อเสนอแนะล่าสุด" : "Latest Suggestions"}
          </h3>
        </div>
        {data.suggestions.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            {isTh ? "ยังไม่มีข้อเสนอแนะ" : "No suggestions yet"}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.suggestions.map((s) => (
              <li key={s.id} className="flex gap-3 px-6 py-4">
                <Quote className="mt-0.5 h-4 w-4 flex-none text-fuchsia-400" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {s.suggestion}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {s.userName || (isTh ? "ไม่ระบุตัวตน" : "Anonymous")} ·{" "}
                    {new Date(s.createdAt).toLocaleString(isTh ? "th-TH" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const StatTile: React.FC<{
  icon: React.ReactNode
  tone: string
  label: string
  value: string
  sub: string
}> = ({ icon, tone, label, value, sub }) => (
  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
    <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone} opacity-10`} />
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
      {icon}
    </div>
    <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
  </div>
)

export default EvaluationView
