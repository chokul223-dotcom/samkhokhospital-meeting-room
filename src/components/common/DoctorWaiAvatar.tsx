import React, { useState, useEffect, useRef, useCallback } from "react"
import { X, Volume2, VolumeX, Heart, Sparkles } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const DoctorWaiAvatar: React.FC = () => {
  const { language } = useApp()
  const [showBubble, setShowBubble] = useState(true)
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const hasSpokenWelcomeRef = useRef(false)

  // Multilingual Greetings Content
  const greetingsData = {
    th: [
      {
        title: "สวัสดีค่ะ ยินดีต้อนรับค่ะ 🙏",
        subtitle: "สวัสดีค่ะ บุคลากรทุกท่าน ยินดีต้อนรับสู่ระบบจองห้องประชุม โรงพยาบาลสามโคก ค่ะ",
        speechText: "สวัสดีค่ะ บุคลากรทุกท่าน ยินดีต้อนรับสู่ระบบจองห้องประชุม โรงพยาบาลสามโคก ค่ะ",
      },
      {
        title: "ต้องการความช่วยเหลือ? 🏥",
        subtitle: (
          <span>
            ติดต่อฝ่ายสารสนเทศ โทร <span className="font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">02-199-3791-2</span>
          </span>
        ),
        speechText: "หากต้องการความช่วยเหลือ สามารถติดต่อฝ่ายสารสนเทศ โทร 02-199-3791 ได้นะคะ",
      },
      {
        title: "ขอให้การประชุมราบรื่นนะคะ ✨",
        subtitle: "ตรวจสอบตารางและจองห้องประชุมได้สะดวกรวดเร็วค่ะ",
        speechText: "ขอให้การประชุมของท่านราบรื่นและมีประสิทธิภาพ ตรวจสอบตารางห้องประชุมได้สะดวกรวดเร็วค่ะ",
      },
      {
        title: "เข้าสู่ระบบใช้งาน 💙",
        subtitle: "กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบได้เลยค่ะ",
        speechText: "กรอกชื่อผู้ใช้และรหัสผ่าน เพื่อเข้าสู่ระบบจองห้องประชุมได้เลยค่ะ",
      },
    ],
    en: [
      {
        title: "Welcome Everyone! 🙏",
        subtitle: "Hello everyone, welcome to Samkhok Hospital Meeting Room Booking System.",
        speechText: "Hello everyone, welcome to Samkhok Hospital Meeting Room Booking System.",
      },
      {
        title: "Need Assistance? 🏥",
        subtitle: (
          <span>
            Contact IT Department at <span className="font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">02-199-3791-2</span>
          </span>
        ),
        speechText: "If you need assistance, please contact the IT Department at 02-199-3791 to 2.",
      },
      {
        title: "Smooth Meetings Ahead ✨",
        subtitle: "Check schedules and book rooms quickly & easily.",
        speechText: "Wishing you smooth and productive meetings. Check schedules and book rooms easily.",
      },
      {
        title: "Staff Login 💙",
        subtitle: "Enter your username and password to log in.",
        speechText: "Please enter your username and password to log in to the booking system.",
      },
    ],
  }

  const currentGreetings = greetingsData[language] || greetingsData.th
  const currentGreeting = currentGreetings[greetingIndex % currentGreetings.length]

  // Play gentle bell chime (Web Audio API)
  const playGentleChime = useCallback(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.08)
        gain.gain.setValueAtTime(0, now + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.06, now + i * 0.08 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.55)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.6)
      })
    } catch {
      // Audio context might be restricted
    }
  }, [])

  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Natural HD Female Voice Player (Google Cloud TTS with fallback)
  const speakText = useCallback(
    (text: string, langCode: "th" | "en") => {
      if (!soundEnabled) return

      try {
        // Stop any ongoing audio or speech
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current = null
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel()
        }

        // Primary Engine: Google HD Female Voice Audio
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${
          langCode === "th" ? "th" : "en"
        }&client=tw-ob&q=${encodeURIComponent(text)}`

        const audio = new Audio(ttsUrl)
        currentAudioRef.current = audio
        audio.playbackRate = langCode === "th" ? 0.88 : 0.9 // Slower, polite & gentle
        audio.volume = 1.0

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          currentAudioRef.current = null
        }
        audio.onerror = () => {
          // Fallback Engine: Web Speech API (with strict Female Voice selection)
          fallbackWebSpeech(text, langCode)
        }

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser autoplay restriction prevents Audio, fallback to Web Speech API
            fallbackWebSpeech(text, langCode)
          })
        }
      } catch {
        fallbackWebSpeech(text, langCode)
      }
    },
    [soundEnabled],
  )

  // Web Speech Fallback with strict Female Voice resolution
  const fallbackWebSpeech = (text: string, langCode: "th" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false)
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = langCode === "th" ? "th-TH" : "en-US"
      utterance.rate = langCode === "th" ? 0.82 : 0.85
      utterance.pitch = 1.25 // Ensure bright female tone

      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        let femaleVoice: SpeechSynthesisVoice | undefined
        if (langCode === "th") {
          femaleVoice =
            voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith("th") &&
                (v.name.includes("Premwadee") ||
                  v.name.includes("Kanya") ||
                  v.name.includes("Narisa") ||
                  v.name.includes("Achara") ||
                  v.name.includes("Siri") ||
                  v.name.includes("Female") ||
                  v.name.includes("Google ภาษาไทย")),
            ) ||
            voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith("th") &&
                !v.name.toLowerCase().includes("niwat") &&
                !v.name.toLowerCase().includes("male"),
            )
        } else {
          femaleVoice =
            voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith("en") &&
                (v.name.includes("Zira") ||
                  v.name.includes("Jenny") ||
                  v.name.includes("Aria") ||
                  v.name.includes("Samantha") ||
                  v.name.includes("Victoria") ||
                  v.name.includes("Karen") ||
                  v.name.includes("Female") ||
                  v.name.includes("Google US English")),
            ) ||
            voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith("en") &&
                !v.name.toLowerCase().includes("david") &&
                !v.name.toLowerCase().includes("guy") &&
                !v.name.toLowerCase().includes("male"),
            )
        }

        if (femaleVoice) {
          utterance.voice = femaleVoice
        }
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }

  // Welcome voice greeting on initial load (with user gesture fallback for browser policy)
  useEffect(() => {
    if (!soundEnabled) return

    const triggerWelcomeVoice = () => {
      if (hasSpokenWelcomeRef.current) return
      hasSpokenWelcomeRef.current = true
      playGentleChime()
      const welcomeText =
        language === "th"
          ? "สวัสดีค่ะ บุคลากรทุกท่าน ยินดีต้อนรับสู่ระบบจองห้องประชุม โรงพยาบาลสามโคก ค่ะ"
          : "Hello everyone, welcome to Samkhok Hospital Meeting Room Booking System."
      setTimeout(() => {
        speakText(welcomeText, language)
      }, 400)
    }

    // Try direct autoplay
    triggerWelcomeVoice()

    // Fallback: trigger on first user click or tap anywhere if browser blocked initial speech
    const handleFirstInteraction = () => {
      if (!hasSpokenWelcomeRef.current) {
        triggerWelcomeVoice()
      }
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
    }

    window.addEventListener("pointerdown", handleFirstInteraction)
    window.addEventListener("keydown", handleFirstInteraction)

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [language, soundEnabled, speakText, playGentleChime])

  // Handle language switch: speak in newly selected language if user changed it
  const prevLangRef = useRef(language)
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language
      if (soundEnabled && hasSpokenWelcomeRef.current) {
        playGentleChime()
        const switchText =
          language === "th"
            ? "ยินดีต้อนรับสู่ระบบจองห้องประชุม โรงพยาบาลสามโคก ค่ะ"
            : "Welcome to Samkhok Hospital Meeting Room Booking System."
        setTimeout(() => {
          speakText(switchText, language)
        }, 300)
      }
    }
  }, [language, soundEnabled, speakText, playGentleChime])

  // Handle avatar click
  const handleDoctorClick = () => {
    const nextIdx = (greetingIndex + 1) % currentGreetings.length
    setGreetingIndex(nextIdx)
    setShowBubble(true)
    setShowHeart(true)
    playGentleChime()

    const nextGreeting = currentGreetings[nextIdx]
    setTimeout(() => {
      speakText(nextGreeting.speechText, language)
    }, 250)

    setTimeout(() => setShowHeart(false), 1200)
  }

  // Auto rotate greeting after some time if open
  useEffect(() => {
    if (!showBubble) return
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % currentGreetings.length)
    }, 12000)
    return () => clearInterval(interval)
  }, [showBubble, currentGreetings.length])

  return (
    <div
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-6 md:right-8 z-30 flex flex-col items-center select-none pointer-events-auto"
      style={{ maxWidth: "340px" }}
    >
      {/* ─── Floating Speech Bubble ─── */}
      {showBubble && !isMinimized && (
        <div className="relative mb-2.5 w-68 sm:w-76 md:w-84 rounded-2xl bg-white/95 dark:bg-slate-900/95 px-4 py-3.5 shadow-2xl backdrop-blur-md border border-sky-100/90 dark:border-slate-700/80 animate-speech-pop text-left">
          {/* Header Bar inside Bubble */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <span
                className={`inline-block h-2 w-2 rounded-full flex-none ${
                  isSpeaking ? "bg-cyan-500 animate-ping" : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 truncate">
                {currentGreeting.title}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-none">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause()
                    currentAudioRef.current = null
                  }
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel()
                  }
                  setIsSpeaking(false)
                  setSoundEnabled((v) => !v)
                }}
                className={`h-6.5 w-6.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  soundEnabled
                    ? "text-sky-600 bg-sky-50 dark:bg-slate-800 dark:text-sky-400 hover:bg-sky-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={
                  soundEnabled
                    ? language === "th"
                      ? "ปิดเสียงพูด"
                      : "Mute voice"
                    : language === "th"
                      ? "เปิดเสียงพูด"
                      : "Unmute voice"
                }
              >
                {soundEnabled ? (
                  <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? "animate-bounce" : ""}`} />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBubble(false)
                }}
                className="h-6.5 w-6.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title={language === "th" ? "ปิดกล่องข้อความ" : "Close"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Subtitle / Body text */}
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {currentGreeting.subtitle}
          </p>

          {/* Speech bubble pointer / arrow */}
          <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/95 dark:border-t-slate-900/95 filter drop-shadow-xs" />
        </div>
      )}

      {/* ─── Doctor Character & Animation Container ─── */}
      {isMinimized ? (
        /* Minimized Floating Badge */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false)
            setShowBubble(true)
            handleDoctorClick()
          }}
          className="group flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/90 py-1.5 px-3.5 shadow-xl border border-sky-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer"
          title={language === "th" ? "คลิกเพื่อฟังเสียงคุณหมอ" : "Click to speak with Doctor"}
        >
          <div className="h-8 w-8 rounded-full overflow-hidden border border-sky-400 bg-sky-50 flex items-center justify-center">
            <img
              src="/doctor-wai.png"
              alt="Doctor Avatar"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
            {language === "th" ? "คุณหมอต้อนรับ 🙏" : "Doctor Welcome 🙏"}
          </span>
        </button>
      ) : (
        /* Full Animated Doctor Character */
        <div
          className="relative group cursor-pointer flex flex-col items-center"
          onClick={handleDoctorClick}
          title={
            language === "th"
              ? "คลิกเพื่อทักทายและฟังเสียงคุณหมอ 🙏"
              : "Click to hear Doctor's greeting 🙏"
          }
        >
          {/* Floating Heart reaction on click */}
          {showHeart && (
            <div className="absolute -top-6 z-40 pointer-events-none animate-ping text-rose-500">
              <Heart className="h-7 w-7 fill-rose-500" />
            </div>
          )}

          {/* Speaking Audio Wave Pulse Indicator */}
          {isSpeaking && (
            <div className="absolute -top-3 z-30 flex items-center gap-1 bg-sky-500/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md animate-pulse">
              <Volume2 className="h-3 w-3" />
              <span>{language === "th" ? "กำลังพูด..." : "Speaking..."}</span>
            </div>
          )}

          {/* Doctor Image with Wai Movement */}
          <div className="relative animate-doctor-wai origin-bottom filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] group-hover:brightness-105 transition-all">
            <img
              src="/doctor-wai.png"
              alt={language === "th" ? "คุณหมอผู้หญิงพนมมือไหว้" : "Female Doctor Wai Greeting"}
              className="h-44 sm:h-52 md:h-60 max-h-[36vh] w-auto object-contain pointer-events-none"
              loading="eager"
            />
          </div>

          {/* Soft Dynamic Ground Shadow */}
          <div className="w-20 sm:w-24 md:w-28 h-3 rounded-full bg-slate-900/40 dark:bg-black/60 blur-[3px] animate-doctor-shadow -mt-1 pointer-events-none" />

          {/* Minimize / Info Tooltip on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-0 translate-y-full pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(true)
              }}
              className="text-[10px] font-semibold text-white/90 hover:text-white bg-black/60 hover:bg-black/85 px-2.5 py-0.5 rounded-full backdrop-blur-xs cursor-pointer shadow-xs transition-colors"
            >
              {language === "th" ? "ย่อขนาด" : "Minimize"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorWaiAvatar

