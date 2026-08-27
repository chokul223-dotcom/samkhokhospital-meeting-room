import React, { useState, useEffect, useRef, useCallback } from "react"
import { Volume2, Heart } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const DoctorWaiAvatar: React.FC = () => {
  const { language } = useApp()
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [soundEnabled] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const hasSpokenWelcomeRef = useRef(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const autoPlayingRef = useRef(false)

  // Multilingual Greetings with Pure Female HD Audio Tracks
  const greetingsData = {
    th: [
      {
        title: "สวัสดีค่ะ ยินดีต้อนรับค่ะ 🙏",
        subtitle: "สวัสดีค่ะ บุคลากรทุกท่าน ยินดีต้อนรับสู่ระบบจองห้องประชุม โรงพยาบาลสามโคก ค่ะ",
        audioSrc: "/audio/th-welcome.mp3",
      },
      {
        title: "ต้องการความช่วยเหลือ? 🏥",
        subtitle: (
          <span>
            ติดต่อฝ่ายสารสนเทศ โทร <span className="font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">02-199-3791-2</span>
          </span>
        ),
        audioSrc: "/audio/th-help.mp3",
      },
      {
        title: "ขอให้การประชุมราบรื่นนะคะ ✨",
        subtitle: "ตรวจสอบตารางและจองห้องประชุมได้สะดวกรวดเร็วค่ะ",
        audioSrc: "/audio/th-meeting.mp3",
      },
      {
        title: "เข้าสู่ระบบใช้งาน 💙",
        subtitle: "กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบได้เลยค่ะ",
        audioSrc: "/audio/th-login.mp3",
      },
    ],
    en: [
      {
        title: "Welcome Everyone! 🙏",
        subtitle: "Hello everyone, welcome to Samkhok Hospital Meeting Room Booking System.",
        audioSrc: "/audio/en-welcome.mp3",
      },
      {
        title: "Need Assistance? 🏥",
        subtitle: (
          <span>
            Contact IT Department at <span className="font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">02-199-3791-2</span>
          </span>
        ),
        audioSrc: "/audio/en-help.mp3",
      },
      {
        title: "Smooth Meetings Ahead ✨",
        subtitle: "Check schedules and book rooms quickly & easily.",
        audioSrc: "/audio/en-meeting.mp3",
      },
      {
        title: "Staff Login 💙",
        subtitle: "Enter your username and password to log in.",
        audioSrc: "/audio/en-login.mp3",
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
        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.08 + 0.02)
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

  // Guaranteed 100% Female Voice Audio Player (with optional onEnded callback for chaining)
  const playVoice = useCallback(
    (audioPath: string, onEnded?: () => void) => {
      if (!soundEnabled) return

      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current.currentTime = 0
          currentAudioRef.current = null
        }

        const audio = new Audio(audioPath)
        currentAudioRef.current = audio
        audio.playbackRate = 0.92 // Slower, polite & clear
        audio.volume = 1.0

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          currentAudioRef.current = null
          if (onEnded) onEnded()
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          currentAudioRef.current = null
        }

        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              hasSpokenWelcomeRef.current = true
            })
            .catch(() => {
              setIsSpeaking(false)
            })
        }
      } catch {
        setIsSpeaking(false)
      }
    },
    [soundEnabled],
  )

  // Auto-play all greetings sequentially: when one finishes, wait then play the next
  const playSequentialGreetings = useCallback(
    (greetings: typeof currentGreetings, startIndex: number) => {
      autoPlayingRef.current = true
      setGreetingIndex(startIndex)

      const playAtIndex = (idx: number) => {
        if (!autoPlayingRef.current) return
        setGreetingIndex(idx)
        playVoice(greetings[idx].audioSrc, () => {
          const nextIdx = idx + 1
          if (nextIdx < greetings.length && autoPlayingRef.current) {
            // Wait 1.5s before playing next greeting
            setTimeout(() => {
              playAtIndex(nextIdx)
            }, 1500)
          } else {
            autoPlayingRef.current = false
          }
        })
      }

      playAtIndex(startIndex)
    },
    [playVoice],
  )

  // Welcome voice greeting on initial load (Direct autoplay attempt + reliable user gesture activation)
  useEffect(() => {
    if (!soundEnabled) return

    const greetings = greetingsData[language] || greetingsData.th

    // 1. Attempt direct autoplay: start sequential playback from greeting 0
    const firstAudio = new Audio(greetings[0].audioSrc)
    firstAudio.playbackRate = 0.92
    firstAudio.volume = 1.0

    firstAudio.onplay = () => setIsSpeaking(true)
    firstAudio.onended = () => {
      setIsSpeaking(false)
      currentAudioRef.current = null
      // After first greeting ends, continue with greeting 1, 2, 3...
      if (greetings.length > 1) {
        setTimeout(() => {
          playSequentialGreetings(greetings, 1)
        }, 1500)
      }
    }

    const autoplayPromise = firstAudio.play()
    if (autoplayPromise !== undefined) {
      autoplayPromise
        .then(() => {
          hasSpokenWelcomeRef.current = true
          currentAudioRef.current = firstAudio
          autoPlayingRef.current = true
          playGentleChime()
        })
        .catch(() => {
          // Autoplay restricted by browser: wait for explicit user click/tap
        })
    }

    // 2. Explicit User Gesture Trigger (Browsers ONLY permit audio on click, pointerdown, touchstart, or keydown)
    const gestureEvents = ["click", "pointerdown", "touchstart", "keydown"]

    const onUserInteraction = () => {
      if (hasSpokenWelcomeRef.current) {
        removeGestureListeners()
        return
      }

      playGentleChime()
      hasSpokenWelcomeRef.current = true
      // Start sequential playback from greeting 0 on first user interaction
      playSequentialGreetings(greetings, 0)
      removeGestureListeners()
    }

    const removeGestureListeners = () => {
      gestureEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction)
      })
    }

    gestureEvents.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, {
        passive: true,
      })
    })

    return () => {
      removeGestureListeners()
    }
  }, [language, soundEnabled, playVoice, playGentleChime, playSequentialGreetings])

  // Handle language switch: speak in newly selected language if user changed it
  const prevLangRef = useRef(language)
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language
      if (soundEnabled && hasSpokenWelcomeRef.current) {
        playGentleChime()
        const switchAudio =
          language === "th" ? "/audio/th-switch.mp3" : "/audio/en-switch.mp3"
        setTimeout(() => {
          playVoice(switchAudio)
        }, 300)
      }
    }
  }, [language, soundEnabled, playVoice, playGentleChime])

  // Handle avatar click: restart sequential playback from next greeting
  const handleDoctorClick = () => {
    // Stop any current auto-play sequence
    autoPlayingRef.current = false
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    const nextIdx = (greetingIndex + 1) % currentGreetings.length
    setShowHeart(true)
    playGentleChime()

    // Start sequential playback from the next greeting
    setTimeout(() => {
      playSequentialGreetings(currentGreetings, nextIdx)
    }, 250)

    setTimeout(() => setShowHeart(false), 1200)
  }

  return (
    <div
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-6 md:right-8 z-30 flex flex-col items-center select-none pointer-events-auto"
      style={{ maxWidth: "340px" }}
    >
      {/* ─── Doctor Character & Animation Container ─── */}
      {isMinimized ? (
        /* Minimized Floating Badge */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false)
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
            <div className="absolute -top-3 z-30 flex items-center gap-1 bg-sky-500/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md animate-pulse whitespace-nowrap">
              <Volume2 className="h-3 w-3 flex-none" />
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
