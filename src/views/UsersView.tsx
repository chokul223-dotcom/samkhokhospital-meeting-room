import React, { useState, useMemo } from "react"
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  Edit2,
  Trash2,
  Building2,
} from "lucide-react"
import { User } from "../types"
import { useApp } from "../context/AppContext"

interface UsersViewProps {
  onOpenUserModal: (user?: User) => void
  onOpenConfirmModal: (config: {
    title: string
    message: string
    onConfirm: () => void
  }) => void
}

export const UsersView: React.FC<UsersViewProps> = ({
  onOpenUserModal,
  onOpenConfirmModal,
}) => {
  const { t, users, currentUser, handleDeleteUser } = useApp()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    )
  }, [users, searchQuery])

  const adminCount = users.filter((u) => u.role === "admin").length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Search Toolbar & Add User Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchUsers}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>ทั้งหมด {users.length} คน</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400">
              Admin {adminCount}
            </span>
          </div>

          <button
            onClick={() => onOpenUserModal()}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.addUser}</span>
          </button>
        </div>
      </div>

      {/* Users Table / Directory Cards */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === "admin"
            const isSelf = user.id === currentUser?.id

            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                {/* User Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div
                    className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl font-bold text-white shadow-sm ${
                      isAdmin
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600"
                        : "bg-gradient-to-tr from-cyan-600 to-teal-500"
                    }`}
                  >
                    {user.name.charAt(0)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </h4>
                      {isSelf && (
                        <span className="rounded-lg bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          (คุณ)
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isAdmin
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <UserIcon className="h-3 w-3 text-slate-400" />
                        )}
                        <span>{isAdmin ? t.admin : t.user}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{user.department || "-"}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {t.username}:{" "}
                        <strong className="text-slate-700 dark:text-slate-300 font-mono">
                          {user.username}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onOpenUserModal(user)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{t.edit}</span>
                  </button>

                  {!isSelf && (
                    <button
                      onClick={() =>
                        onOpenConfirmModal({
                          title: t.delete,
                          message: t.confirmDeleteUser,
                          onConfirm: () => handleDeleteUser(user.id),
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 px-3.5 py-2 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.delete}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
export default UsersView
