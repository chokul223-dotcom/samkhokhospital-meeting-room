import React, { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { AppProvider, useApp } from "./context/AppContext"
import { KcmhNavbar } from "./components/layout/KcmhNavbar"
import { KcmhHeroHeader } from "./components/layout/KcmhHeroHeader"
import { KcmhFooter } from "./components/layout/KcmhFooter"
import { Toast } from "./components/common/Toast"

import { LoginView } from "./views/LoginView"
import { RegisterView } from "./views/RegisterView"
import { DashboardView } from "./views/DashboardView"
import { BookingsView } from "./views/BookingsView"
import { RoomsView } from "./views/RoomsView"
import { UsersView } from "./views/UsersView"
import { SettingsView } from "./views/SettingsView"
import { ProfileView } from "./views/ProfileView"
import { ResetPasswordView } from "./views/ResetPasswordView"
import { VerifyEmailView } from "./views/VerifyEmailView"

import { BookingModal } from "./components/modals/BookingModal"
import { RoomModal } from "./components/modals/RoomModal"
import { UserModal } from "./components/modals/UserModal"
import { RejectModal } from "./components/modals/RejectModal"
import { ConfirmModal } from "./components/modals/ConfirmModal"
import { CookieConsentBanner } from "./components/common/CookieConsentBanner"
import { ApprovalBanner } from "./components/common/ApprovalBanner"
import { Room, User } from "./types"

// ── Protected Route — redirect to /login if not authenticated ──────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

// ── Admin-only Route ───────────────────────────────────────────────────────
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// ── Guest-only Route — redirect to /dashboard if already logged in ──────────
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp()
  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

// ── Main App Shell (with Navbar/Footer/Modals) ─────────────────────────────
function MainShell() {
  const { currentUser, approvalVisible, dismissApproval, language } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine activeTab from current path for Navbar highlight
  const pathToTab: Record<string, string> = {
    "/": "dashboard",
    "/dashboard": "dashboard",
    "/rooms": "rooms",
    "/bookings": "bookings",
    "/users": "users",
    "/settings": "settings",
    "/profile": "profile",
    "/login": "login",
    "/register": "register",
  }
  const activeTab = pathToTab[location.pathname] ?? "dashboard"

  // Modals state
  const [bookingModalConfig, setBookingModalConfig] = useState<{
    open: boolean
    roomId?: string
    date?: string
  }>({ open: false })

  const [roomModalConfig, setRoomModalConfig] = useState<{
    open: boolean
    room?: Room
  }>({ open: false })

  const [userModalConfig, setUserModalConfig] = useState<{
    open: boolean
    user?: User
  }>({ open: false })

  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null)

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ open: false, title: "", message: "", onConfirm: () => {} })

  const [initialBookingFilter, setInitialBookingFilter] = useState("all")

  const handleNavigateWithFilter = (tab: string, filter?: string) => {
    const tabToPath: Record<string, string> = {
      dashboard: currentUser ? "/dashboard" : "/",
      home: currentUser ? "/dashboard" : "/",
      rooms: "/rooms",
      bookings: "/bookings",
      users: "/users",
      settings: "/settings",
      profile: "/profile",
    }
    navigate(tabToPath[tab] ?? (currentUser ? "/dashboard" : "/"))
    if (filter) setInitialBookingFilter(filter)
  }

  const handleOpenBookingModal = (roomId?: string, date?: string) => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    setBookingModalConfig({ open: true, roomId, date })
  }

  const showHeroHeader = !currentUser && ["/", "/rooms"].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <KcmhNavbar activeTab={activeTab} setActiveTab={(tab) => handleNavigateWithFilter(tab)} />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {showHeroHeader && <KcmhHeroHeader />}

        <main className="flex-1 w-full">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <DashboardView
                  onNavigateTab={handleNavigateWithFilter}
                  onOpenBookingModal={handleOpenBookingModal}
                />
              }
            />
            <Route
              path="/rooms"
              element={
                <RoomsView
                  onOpenRoomModal={(room) => setRoomModalConfig({ open: true, room })}
                  onOpenBookingModal={handleOpenBookingModal}
                  onOpenConfirmModal={(cfg) => setConfirmModalConfig({ open: true, ...cfg })}
                />
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardView
                    onNavigateTab={handleNavigateWithFilter}
                    onOpenBookingModal={handleOpenBookingModal}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/bookings"
              element={
                <RequireAuth>
                  <BookingsView
                    initialStatusFilter={initialBookingFilter}
                    onOpenBookingModal={() => handleOpenBookingModal()}
                    onOpenRejectModal={(id) => setRejectingBookingId(id)}
                    onOpenConfirmModal={(cfg) => setConfirmModalConfig({ open: true, ...cfg })}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAdmin>
                  <UsersView
                    onOpenUserModal={(user) => setUserModalConfig({ open: true, user })}
                    onOpenConfirmModal={(cfg) => setConfirmModalConfig({ open: true, ...cfg })}
                  />
                </RequireAdmin>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsView />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfileView onBack={() => navigate("/dashboard")} />
                </RequireAuth>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} replace />} />
          </Routes>
        </main>

      </div>

      <KcmhFooter />

      {/* Global Modals */}
      {bookingModalConfig.open && (
        <BookingModal
          initialRoomId={bookingModalConfig.roomId}
          initialDate={bookingModalConfig.date}
          onClose={() => setBookingModalConfig({ open: false })}
        />
      )}
      {roomModalConfig.open && (
        <RoomModal
          room={roomModalConfig.room}
          onClose={() => setRoomModalConfig({ open: false })}
        />
      )}
      {userModalConfig.open && (
        <UserModal
          user={userModalConfig.user}
          onClose={() => setUserModalConfig({ open: false })}
        />
      )}
      {rejectingBookingId && (
        <RejectModal
          bookingId={rejectingBookingId}
          onClose={() => setRejectingBookingId(null)}
        />
      )}
      {confirmModalConfig.open && (
        <ConfirmModal
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          onConfirm={confirmModalConfig.onConfirm}
          onClose={() => setConfirmModalConfig((prev) => ({ ...prev, open: false }))}
        />
      )}

      <Toast />

      {approvalVisible && (
        <ApprovalBanner
          language={language as "th" | "en"}
          onDismiss={dismissApproval}
        />
      )}

      <CookieConsentBanner />
    </div>
  )
}

// ── Handle legacy ?reset_token / ?verify_email_token on any page ──────────
function TokenRedirectHandler() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  if (params.get("reset_token")) {
    return <Navigate to={`/reset-password${location.search}`} replace />
  }
  if (params.get("verify_email_token")) {
    return <Navigate to={`/verify-email${location.search}`} replace />
  }
  return <MainShell />
}

// ── Root Router — standalone pages vs. shell pages ────────────────────────
function AppRoutes() {
  const location = useLocation()

  return (
    <Routes>
      {/* ── Standalone pages — guest only (redirect to /dashboard if already logged in) ── */}
      <Route path="/login" element={<GuestOnly><LoginView /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterView /></GuestOnly>} />
      <Route
        path="/reset-password"
        element={
          <ResetPasswordView
            token={new URLSearchParams(location.search).get("reset_token") ?? ""}
            onDone={() => {
              window.history.replaceState({}, document.title, window.location.pathname)
              window.location.replace("/login")
            }}
          />
        }
      />
      <Route
        path="/verify-email"
        element={
          <VerifyEmailView
            token={new URLSearchParams(location.search).get("verify_email_token") ?? ""}
            onDone={() => {
              window.history.replaceState({}, document.title, window.location.pathname)
              // If a user token exists in storage they were already logged in
              const hasSession = !!localStorage.getItem("token")
              if (hasSession) window.location.reload()
              else window.location.replace("/login")
            }}
          />
        }
      />

      {/* ── All other routes → go through MainShell (with Navbar) ── */}
      <Route path="*" element={<TokenRedirectHandler />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
