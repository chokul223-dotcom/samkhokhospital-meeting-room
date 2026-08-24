import React, { useState, useRef, useEffect } from "react"
import { X, ChevronRight, ChevronLeft } from "lucide-react"

export const VideoWidget: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(true)
  const [videoSide, setVideoSide] = useState<"left" | "right">("left")
  const [videoPosY, setVideoPosY] = useState<number>(() =>
    typeof window !== "undefined" ? Math.max(0, window.innerHeight - 240) : 500,
  )
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{
    startMX: number
    startMY: number
    startX: number
    startY: number
  } | null>(null)
  const isDraggingRef = useRef(false)

  const isDragging = dragPos !== null
  const TOGGLE_W = 36
  const VID_W = 280
  const totalW = isVideoOpen ? VID_W + TOGGLE_W : TOGGLE_W
  const snappedX = isDragging
    ? dragPos.x
    : videoSide === "left"
      ? 0
      : Math.max(
          0,
          (typeof window !== "undefined" ? window.innerWidth : 400) - totalW,
        )
  const snappedY = isDragging ? dragPos.y : videoPosY

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoModalOpen(false)
      }
    }
    if (isVideoModalOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isVideoModalOpen])

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: snappedX,
          top: snappedY,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          flexDirection: videoSide === "right" ? "row-reverse" : "row",
          touchAction: "none",
          transition: isDragging
            ? "none"
            : "left 0.35s cubic-bezier(0.25,0.46,0.45,0.94), top 0.3s ease",
          userSelect: "none",
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          const rect =
            (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          dragRef.current = {
            startMX: e.clientX,
            startMY: e.clientY,
            startX: rect.left,
            startY: rect.top,
          }
          isDraggingRef.current = false
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const dx = e.clientX - dragRef.current.startMX
          const dy = e.clientY - dragRef.current.startMY
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            if (!isDraggingRef.current) {
              isDraggingRef.current = true
              ;(e.currentTarget as HTMLDivElement).setPointerCapture(
                e.pointerId,
              )
            }
            setDragPos({
              x: Math.max(
                0,
                Math.min(window.innerWidth - 60, dragRef.current.startX + dx),
              ),
              y: Math.max(
                0,
                Math.min(window.innerHeight - 60, dragRef.current.startY + dy),
              ),
            })
          }
        }}
        onPointerUp={(e) => {
          if (isDraggingRef.current && dragPos) {
            const centerX = dragPos.x + totalW / 2
            const newSide = centerX > window.innerWidth / 2 ? "right" : "left"
            setVideoSide(newSide)
            setVideoPosY(
              Math.max(0, Math.min(window.innerHeight - 60, dragPos.y)),
            )
            try {
              ;(e.currentTarget as HTMLDivElement).releasePointerCapture(
                e.pointerId,
              )
            } catch {}
          }
          dragRef.current = null
          isDraggingRef.current = false
          setDragPos(null)
        }}
        onPointerCancel={() => {
          dragRef.current = null
          isDraggingRef.current = false
          setDragPos(null)
        }}
      >
        {/* Video preview container */}
        <div
          className={`overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
            isVideoOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ width: isVideoOpen ? VID_W : 0 }}
        >
          <div
            role="button"
            tabIndex={0}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 shadow-2xl cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]"
            onClick={() => {
              if (!isDraggingRef.current && !dragPos) {
                setIsVideoModalOpen(true)
              }
            }}
          >
            <div className="relative pt-[56.25%] bg-slate-950">
              <video
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                src="/video.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
              {/* Subtle hover shade */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            <div className="p-2.5 bg-slate-900/95 text-white text-[11px] font-medium flex items-center justify-between">
              <span className="truncate">โรงพยาบาลสามโคก แนะนำสถานที่</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/20 px-1.5 py-0.5 rounded">
                HD
              </span>
            </div>
          </div>
        </div>

        {/* Toggle drawer button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsVideoOpen((v) => !v)
          }}
          className="flex-none flex h-11 w-8 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/10 transition-colors cursor-pointer"
          style={{
            marginLeft: videoSide === "left" ? 6 : 0,
            marginRight: videoSide === "right" ? 6 : 0,
          }}
          title={isVideoOpen ? "Hide video widget" : "Show video widget"}
        >
          {isVideoOpen ? (
            videoSide === "left" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : videoSide === "left" ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Fullscreen Video Modal (Modal lightbox with full controls like Image 2) */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          {/* Close 'X' Button at top-right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsVideoModalOpen(false)
            }}
            className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-all z-50 cursor-pointer"
            title="ปิด (Close)"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Modal Video Container */}
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              className="h-full w-full object-contain"
              src="/video.mp4"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </>
  )
}
export default VideoWidget
