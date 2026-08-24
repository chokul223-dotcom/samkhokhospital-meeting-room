import React, { useState, useRef } from "react"
import { Play, X, ChevronRight, ChevronLeft } from "lucide-react"

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
  const hasMoved = useRef(false)

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
          hasMoved.current = false
          setDragPos({ x: rect.left, y: rect.top })
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const dx = e.clientX - dragRef.current.startMX
          const dy = e.clientY - dragRef.current.startMY
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true
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
        }}
        onPointerUp={() => {
          if (hasMoved.current && dragPos) {
            const centerX = dragPos.x + totalW / 2
            const newSide = centerX > window.innerWidth / 2 ? "right" : "left"
            setVideoSide(newSide)
            setVideoPosY(
              Math.max(0, Math.min(window.innerHeight - 60, dragPos.y)),
            )
          }
          dragRef.current = null
          setDragPos(null)
        }}
        onPointerCancel={() => {
          dragRef.current = null
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
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 backdrop-blur-md shadow-2xl"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onClick={() => {
              if (!hasMoved.current) setIsVideoModalOpen(true)
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
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-900/90 text-white text-[11px] font-medium flex items-center justify-between">
              <span className="truncate">โรงพยาบาลสามโคก แนะนำสถานที่</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase">
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
          className="flex-none flex h-11 w-8 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/10 transition-colors"
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

      {/* Fullscreen Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 animate-in fade-in duration-200">
          <button
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
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
