export type Role = "admin" | "user"
export type ThemeOption = "light" | "dark"
export type Language = "th" | "en"

export type RoomStatus = "available" | "maintenance"
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface User {
  id: string
  name: string
  department: string
  role: "admin" | "user"
  username: string
  email?: string
  emailVerified?: boolean
  password?: string
  createdAt?: string
  gender?: string
  citizenId?: string
  phone?: string
  address?: string
  country?: string
  province?: string
  zipcode?: string
  avatarUrl?: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  location: string
  equipment: string[]
  status: RoomStatus
  imageUrl?: string
}

export interface Booking {
  id: string
  roomId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees: number
  status: BookingStatus
  rejectReason?: string | null
  createdAt: string
  note?: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    department: string
    role: Role
    username: string
    email: string
    emailVerified: boolean
  }
}

export interface CookieConsentPreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  hasAnswered: boolean
  updatedAt?: string
}
