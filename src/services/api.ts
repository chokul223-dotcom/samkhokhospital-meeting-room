import { Booking, Room, User, LoginResponse } from "../types"

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/$/, "")
export const API_URL = BASE_URL

function getToken(): string | null {
  return localStorage.getItem("token")
}

// Callback ที่ AppContext จะ inject เพื่อจัดการ logout ผ่าน React state
let _onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }))
    // แจ้ง AppContext ให้ logout เมื่อ token ไม่ถูกต้องหรือหมดอายุ (ไม่รวม offline mock session)
    if (res.status === 401 && token && token !== "offline-mock") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      _onUnauthorized?.()
    }
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem("token", data.token)
  localStorage.setItem("user", JSON.stringify(data.user))
  return data
}

export async function register(data: { email: string; username?: string; password: string; name: string }): Promise<any> {
  // Mock registration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, user: data })
    }, 500)
  })
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getSavedUser(): User | null {
  const u = localStorage.getItem("user")
  return u ? JSON.parse(u) : null
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function fetchRooms(): Promise<Room[]> {
  return request<Room[]>("/api/rooms")
}

export async function fetchPublicRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/api/rooms/public`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function addRoom(
  data: Omit<Room, "id"> & { id?: string },
): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function editRoom(
  id: string,
  data: Partial<Room>,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteRoom(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/rooms/${id}`, {
    method: "DELETE",
  })
}

export async function updateRoomStatus(
  id: string,
  status: Room["status"],
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/rooms/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function fetchBookings(): Promise<Booking[]> {
  return request<Booking[]>("/api/bookings")
}

export async function fetchPublicBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/api/bookings/public`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function createBooking(data: {
  roomId: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees: number
}): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
  rejectReason?: string,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(rejectReason ? { rejectReason } : {}) }),
  })
}

export async function deleteBooking(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/bookings/${id}`, {
    method: "DELETE",
  })
}

export async function deleteAllBookings(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/bookings", {
    method: "DELETE",
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  return request<User[]>("/api/users")
}

export async function createUser(data: {
  name: string
  department: string
  role: string
  username?: string
  email: string
  password?: string
}): Promise<User> {
  return request<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateUser(
  id: string,
  data: {
    name: string
    department: string
    role: string
    username?: string
    email?: string
    password?: string
  },
): Promise<User> {
  return request<User>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/users/${id}`, {
    method: "DELETE",
  })
}

export async function sendPasswordReset(userId: string): Promise<{ success: boolean; message: string; dev_token?: string; reset_link?: string }> {
  return request(`/api/users/${userId}/send-reset`, { method: "POST" })
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  })
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; name?: string; username?: string; expiresAt?: string }> {
  return request(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
}

export async function sendVerifyEmail(userId: string): Promise<{ success: boolean; message: string; dev_token?: string; verify_link?: string }> {
  return request(`/api/users/${userId}/send-verify-email`, { method: "POST" })
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  return request("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}
