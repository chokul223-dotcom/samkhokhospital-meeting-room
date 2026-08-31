export interface RoomColorConfig {
  id: string
  name: string
  bgClass: string
  textClass: string
  borderClass: string
  dotClass: string
  hex: string
}

export const ROOM_COLORS: Record<string, RoomColorConfig> = {
  r1: {
    id: "r1",
    name: "ห้องประชุมเล็ก 1",
    bgClass: "bg-blue-600 dark:bg-blue-600",
    textClass: "text-white",
    borderClass: "border-blue-700",
    dotClass: "bg-blue-500",
    hex: "#3b82f6",
  },
  r2: {
    id: "r2",
    name: "ห้องประชุมใหญ่",
    bgClass: "bg-purple-600 dark:bg-purple-600",
    textClass: "text-white",
    borderClass: "border-purple-700",
    dotClass: "bg-purple-500",
    hex: "#9333ea",
  },
}

const FALLBACK_PALETTE: RoomColorConfig[] = [
  {
    id: "fb1",
    name: "ห้องประชุมเล็ก 1",
    bgClass: "bg-blue-600 dark:bg-blue-600",
    textClass: "text-white",
    borderClass: "border-blue-700",
    dotClass: "bg-blue-500",
    hex: "#3b82f6",
  },
  {
    id: "fb2",
    name: "ห้องประชุมใหญ่",
    bgClass: "bg-purple-600 dark:bg-purple-600",
    textClass: "text-white",
    borderClass: "border-purple-700",
    dotClass: "bg-purple-500",
    hex: "#9333ea",
  },
  {
    id: "fb3",
    name: "ห้องประชุม 3",
    bgClass: "bg-amber-600 dark:bg-amber-600",
    textClass: "text-white",
    borderClass: "border-amber-700",
    dotClass: "bg-amber-500",
    hex: "#d97706",
  },
]

export function getRoomColor(roomId: string, index = 0): RoomColorConfig {
  if (ROOM_COLORS[roomId]) {
    return ROOM_COLORS[roomId]
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
}

export function getRoomImage(roomId: string, index = 0): string {
  if (roomId === "r1" || index === 0) {
    return "/rooms/room_small.jpg"
  }
  if (roomId === "r2" || index === 1) {
    return "/rooms/room_large.jpg"
  }
  return "/rooms/room_small.jpg"
}
