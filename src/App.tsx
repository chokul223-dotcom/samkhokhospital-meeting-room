import React, { useState } from "react"
import { AppProvider, useApp } from "./context/AppContext"
import { KcmhNavbar } from "./components/layout/KcmhNavbar"
import { KcmhHeroHeader } from "./components/layout/KcmhHeroHeader"
import { KcmhFooter } from "./components/layout/KcmhFooter"
import { Toast } from "./components/common/Toast"

import { LoginView } from "./views/LoginView"
import { DashboardView } from "./views/DashboardView"
import { BookingsView } from "./views/BookingsView"
import { RoomsView } from "./views/RoomsView"
import { UsersView } from "./views/UsersView"
import { SettingsView } from "./views/SettingsView"
import { ProfileView } from "./views/ProfileView"

import { BookingModal } from "./components/modals/BookingModal"
import { RoomModal } from "./components/modals/RoomModal"
import { UserModal } from "./components/modals/UserModal"
import { RejectModal } from "./components/modals/RejectModal"
import { ConfirmModal } from "./components/modals/ConfirmModal"
import { CookieConsentBanner } from "./components/common/CookieConsentBanner"
import { Room, User } from "./types"

function MainContent() {
  const { currentUser } = useApp()
  const [activeTab, setActiveTab] = useState("dashboard")

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

  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(
    null,
  )

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ open: false, title: "", message: "", onConfirm: () => {} })

  // Status Filter passed to BookingsView
  const [initialBookingFilter, setInitialBookingFilter] = useState("all")

  // Auto-redirect to dashboard if logged in and on login tab
  React.useEffect(() => {
    if (activeTab === "login" && currentUser) {
      setActiveTab("dashboard")
    }
  }, [activeTab, currentUser])

  // If user navigated to login tab, show their original LoginView
  if (activeTab === "login" && !currentUser) {
    return (
      <>
        <LoginView onBackToHome={() => setActiveTab("dashboard")} />
        <CookieConsentBanner />
      </>
    )
  }

  const handleNavigateWithFilter = (tab: string, filter?: string) => {
    setActiveTab(tab)
    if (filter) {
      setInitialBookingFilter(filter)
    }
  }

  const handleOpenBookingModal = (roomId?: string, date?: string) => {
    // If not logged in and wants to book, allow booking or prompt
    setBookingModalConfig({ open: true, roomId, date })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ─── KCMH Top Navigation Bar ─── */}
      <KcmhNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ─── Main Content Container ─── */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Centered Hero Header on Dashboard/Home/Rooms tab */}
        {(activeTab === "dashboard" ||
          activeTab === "home" ||
          activeTab === "rooms") && <KcmhHeroHeader />}

        {/* ─── Active Screen View ─── */}
        <main className="flex-1 w-full">
          {(activeTab === "dashboard" || activeTab === "home") && (
            <DashboardView
              onNavigateTab={handleNavigateWithFilter}
              onOpenBookingModal={handleOpenBookingModal}
            />
          )}

          {activeTab === "rooms" && (
            <RoomsView
              onOpenRoomModal={(room) =>
                setRoomModalConfig({ open: true, room })
              }
              onOpenBookingModal={handleOpenBookingModal}
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "bookings" && currentUser && (
            <BookingsView
              initialStatusFilter={initialBookingFilter}
              onOpenBookingModal={() => handleOpenBookingModal()}
              onOpenRejectModal={(id) => setRejectingBookingId(id)}
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "users" && currentUser?.role === "admin" && (
            <UsersView
              onOpenUserModal={(user) =>
                setUserModalConfig({ open: true, user })
              }
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "settings" && currentUser && <SettingsView />}

          {activeTab === "profile" && currentUser && (
            <ProfileView onBack={() => setActiveTab("dashboard")} />
          )}
        </main>
      </div>

      {/* ─── KCMH Footer ─── */}
      <KcmhFooter />

      {/* ─── Global Modals ─── */}
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
          onClose={() =>
            setConfirmModalConfig((prev) => ({ ...prev, open: false }))
          }
        />
      )}

      {/* Animated Toast Notification */}
      <Toast />

      {/* Cookie Consent */}
      <CookieConsentBanner />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
