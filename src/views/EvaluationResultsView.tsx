import React, { useEffect, useMemo, useState } from "react"
import {
  MessageSquareText,
  ChartColumn,
  Users,
  TrendingUp,
  LoaderCircle,
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

export const EvaluationResultsView: React.FC = () => {
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
    const avgs = ALL_EVALUATION_QUESTIONS.map(
      (q) => data.questions[q.id]?.average || 0
    ).filter(Boolean)
    return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0
  }, [data])

  const overallLevel = interpretAverage(overall)

  return (
    <div className="max-w-5xl mx-auto space-y-5 eval-fade-up">
      {/* ── Page Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0738] via-[#3b1170] to-[#6d28d9] text-white shadow-xl shadow-purple-900/20">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl" />

        <div className="relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur animate-float-subtle">
            <ChartColumn className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-200/90">
              {isTh ? "ผลประเมิน" : "Evaluation Results"}
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-bold leading-tight">
              {isTh
                ? "สรุปผลการประเมินความพึงพอใจการใช้ระบบ"
                : "System Satisfaction Evaluation Results"}
            </h1>
            <p className="mt-1 text-sm text-purple-100/80">
              {isTh
                ? "ภาพรวมสถิติคะแนนความพึงพอใจรายข้อและข้อเสนอแนะจากผู้ใช้งาน โรงพยาบาลสามโคก"
                : "Overview of satisfaction statistics and user suggestions for Samkhok Hospital"}
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start sm:self-center rounded-2xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur transition-all cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{isTh ? "รีเฟรชข้อมูล" : "Refresh"}</span>
          </button>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-20 text-sm text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin text-purple-600" />
          {isTh ? "กำลังโหลดผลการประเมิน..." : "Loading results..."}
        </div>
      ) : error || !data ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 py-14 text-center">
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {isTh ? "ไม่สามารถโหลดผลการประเมินได้" : "Could not load results"}: {error}
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {isTh ? "ลองใหม่" : "Retry"}
          </button>
        </div>
      ) : (
        <div className="space-y-5 eval-fade-up">
          {/* ── Stat cards ─────────────────────────────────────────────── */}
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
              sub={
                overallLevel
                  ? `${overallLevel.emoji} ${isTh ? overallLevel.th : overallLevel.en}`
                  : "/ 5.00"
              }
            />
            <StatTile
              icon={<MessageSquareText className="h-5 w-5" />}
              tone="from-fuchsia-500 to-pink-600"
              label={isTh ? "ข้อเสนอแนะ" : "Suggestions"}
              value={data.suggestions.length.toLocaleString()}
              sub={isTh ? "รายการล่าสุด" : "latest"}
            />
          </div>

          {/* ── Per-question breakdown ─────────────────────────────────── */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ChartColumn className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                {isTh ? "ผลการประเมินรายข้อ" : "Results by Question"}
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {RATING_LEVELS.map((lv) => (
                  <span
                    key={lv.score}
                    className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"
                  >
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
                          <span className="ml-auto">n = {count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Suggestions ────────────────────────────────────────────── */}
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
                        {new Date(s.createdAt).toLocaleString(
                          isTh ? "th-TH" : "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
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
    <div
      className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tone} opacity-10`}
    />
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}
    >
      {icon}
    </div>
    <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
      {value}
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
  </div>
)

export default EvaluationResultsView
