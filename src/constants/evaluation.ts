// ── แบบประเมินความพึงพอใจการใช้ระบบ ────────────────────────────────────────
// หมายเหตุ: หากเพิ่ม/ลบข้อคำถาม ให้แก้ QUESTION_IDS ใน backend/routes/evaluations.js ด้วย

export interface EvaluationQuestion {
  id: string
  th: string
  en: string
}

export interface EvaluationSection {
  id: string
  th: string
  en: string
  questions: EvaluationQuestion[]
}

export const EVALUATION_SECTIONS: EvaluationSection[] = [
  {
    id: "s1",
    th: "ด้านการใช้ระบบจองห้องประชุม",
    en: "Meeting Room Booking System Usage",
    questions: [
      {
        id: "q1_1",
        th: "ระบบใช้งานง่ายไม่ซับซ้อน",
        en: "The system is easy and uncomplicated to use",
      },
      {
        id: "q1_2",
        th: "ระบบมีประสิทธิภาพในการตอบสนองที่รวดเร็ว",
        en: "The system responds quickly and efficiently",
      },
      {
        id: "q1_3",
        th: "คู่มือระบบมีรายละเอียดที่ครบถ้วนชัดเจน",
        en: "The system manual is complete and clear",
      },
    ],
  },
]

export const ALL_EVALUATION_QUESTIONS = EVALUATION_SECTIONS.flatMap((s) => s.questions)

export interface RatingLevel {
  score: 1 | 2 | 3 | 4 | 5
  th: string
  en: string
  emoji: string
  /** Tailwind classes for the selected state */
  active: string
  /** Tailwind classes for the dot/bar color */
  dot: string
}

export const RATING_LEVELS: RatingLevel[] = [
  {
    score: 5,
    th: "พอใจมากที่สุด",
    en: "Very Satisfied",
    emoji: "😍",
    active: "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30",
    dot: "bg-emerald-500",
  },
  {
    score: 4,
    th: "พอใจมาก",
    en: "Satisfied",
    emoji: "😊",
    active: "bg-teal-500 border-teal-500 text-white shadow-teal-500/30",
    dot: "bg-teal-500",
  },
  {
    score: 3,
    th: "พอใจปานกลาง",
    en: "Neutral",
    emoji: "🙂",
    active: "bg-amber-400 border-amber-400 text-slate-900 shadow-amber-400/30",
    dot: "bg-amber-400",
  },
  {
    score: 2,
    th: "พอใจน้อย",
    en: "Dissatisfied",
    emoji: "😕",
    active: "bg-orange-500 border-orange-500 text-white shadow-orange-500/30",
    dot: "bg-orange-500",
  },
  {
    score: 1,
    th: "พอใจน้อยที่สุด",
    en: "Very Dissatisfied",
    emoji: "😞",
    active: "bg-rose-500 border-rose-500 text-white shadow-rose-500/30",
    dot: "bg-rose-500",
  },
]

/** แปลค่าเฉลี่ยเป็นระดับความพึงพอใจ (เกณฑ์มาตรฐาน 5 ระดับ) */
export function interpretAverage(avg: number): RatingLevel | null {
  if (!avg) return null
  if (avg >= 4.51) return RATING_LEVELS[0]
  if (avg >= 3.51) return RATING_LEVELS[1]
  if (avg >= 2.51) return RATING_LEVELS[2]
  if (avg >= 1.51) return RATING_LEVELS[3]
  return RATING_LEVELS[4]
}
