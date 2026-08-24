import React, { useState } from "react"
import { AppProvider, useApp } from "./context/AppContext"
import { Sidebar } from "./components/layout/Sidebar"
import { Header } from "./components/layout/Header"
import { MobileNav } from "./components/layout/MobileNav"
import { Toast } from "./components/common/Toast"
import { ThemeToggle } from "./components/common/ThemeToggle"

import { LoginView } from "./views/LoginView"
import { DashboardView } from "./views/DashboardView"
import { CalendarView } from "./views/CalendarView"
import { BookingsView } from "./views/BookingsView"
import { RoomsView } from "./views/RoomsView"
import { UsersView } from "./views/UsersView"
import { SettingsView } from "./views/SettingsView"

import { BookingModal } from "./components/modals/BookingModal"
import { RoomModal } from "./components/modals/RoomModal"
import { UserModal } from "./components/modals/UserModal"
import { RejectModal } from "./components/modals/RejectModal"
import { ConfirmModal } from "./components/modals/ConfirmModal"
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

  if (!currentUser) {
    return <LoginView />
  }

  const handleNavigateWithFilter = (tab: string, filter?: string) => {
    setActiveTab(tab)
    if (filter) {
      setInitialBookingFilter(filter)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* Mobile Navigation Bar */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Header */}
          <Header
            activeTab={activeTab}
            onOpenBookingModal={() => setBookingModalConfig({ open: true })}
            onOpenRoomModal={() => setRoomModalConfig({ open: true })}
            onOpenUserModal={() => setUserModalConfig({ open: true })}
          />

          {/* Active Screen View */}
          {activeTab === "dashboard" && (
            <DashboardView
              onNavigateTab={handleNavigateWithFilter}
              onOpenBookingModal={(roomId) =>
                setBookingModalConfig({ open: true, roomId })
              }
            />
          )}

          {activeTab === "calendar" && (
            <CalendarView
              onOpenBookingModal={(roomId, date) =>
                setBookingModalConfig({ open: true, roomId, date })
              }
            />
          )}

          {activeTab === "bookings" && (
            <BookingsView
              initialStatusFilter={initialBookingFilter}
              onOpenBookingModal={() => setBookingModalConfig({ open: true })}
              onOpenRejectModal={(id) => setRejectingBookingId(id)}
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "rooms" && (
            <RoomsView
              onOpenRoomModal={(room) =>
                setRoomModalConfig({ open: true, room })
              }
              onOpenBookingModal={(roomId) =>
                setBookingModalConfig({ open: true, roomId })
              }
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "users" && currentUser.role === "admin" && (
            <UsersView
              onOpenUserModal={(user) =>
                setUserModalConfig({ open: true, user })
              }
              onOpenConfirmModal={(cfg) =>
                setConfirmModalConfig({ open: true, ...cfg })
              }
            />
          )}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

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
          onClose={() =>
            setConfirmModalConfig((prev) => ({ ...prev, open: false }))
          }
        />
      )}

      {/* Floating Theme Toggle (Bottom Right) */}
      <ThemeToggle variant="floating" />

      {/* Animated Toast Notification */}
      <Toast />
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
