// Central API helper — all calls go through here

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  user: { id: string; name: string; department: string; role: string; username: string }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getSavedUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function fetchRooms() {
  return request<any[]>('/api/rooms')
}

export async function addRoom(data: any) {
  return request<any>('/api/rooms', { method: 'POST', body: JSON.stringify(data) })
}

export async function editRoom(id: string, data: any) {
  return request<any>(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteRoom(id: string) {
  return request<any>(`/api/rooms/${id}`, { method: 'DELETE' })
}

export async function updateRoomStatus(id: string, status: string) {
  return request(`/api/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function fetchBookings() {
  return request<any[]>('/api/bookings')
}

export async function createBooking(data: {
  roomId: string; date: string; startTime: string; endTime: string; purpose: string; attendees: number
}) {
  return request<any>('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateBookingStatus(id: string, status: string) {
  return request(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function deleteBooking(id: string) {
  return request(`/api/bookings/${id}`, { method: 'DELETE' })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  return request<any[]>('/api/users')
}

export async function createUser(data: {
  name: string; department: string; role: string; username: string; password: string
}) {
  return request<any>('/api/users', { method: 'POST', body: JSON.stringify(data) })
}

export async function deleteUser(id: string) {
  return request(`/api/users/${id}`, { method: 'DELETE' })
}
