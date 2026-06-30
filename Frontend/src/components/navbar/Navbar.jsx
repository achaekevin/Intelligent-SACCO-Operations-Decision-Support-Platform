import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, Search } from 'lucide-react'
import { toggleMobileSidebar, toggleTheme } from '../../redux/slices/uiSlice'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../constants/roles'
import { initials } from '../../utils/format'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme } = useSelector((s) => s.ui)
  const { list: notifications } = useSelector((s) => s.notifications)
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-ink-800/90 backdrop-blur border-b border-ink-100 dark:border-ink-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1">
        <button
          className="lg:hidden text-ink-700 dark:text-ink-100"
          onClick={() => dispatch(toggleMobileSidebar())}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-ink-50 dark:bg-ink-700/50 rounded-lg px-3 py-2 w-full max-w-sm">
          <Search size={16} className="text-ink-400" />
          <input
            type="text"
            placeholder="Search members, loans, transactions..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-400 text-ink-700 dark:text-ink-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false) }}
            className="relative p-2 rounded-lg text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-ink-800 rounded-xl shadow-card-hover border border-ink-100 dark:border-ink-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700 flex items-center justify-between">
                <span className="font-semibold text-sm text-ink-800 dark:text-ink-50">Notifications</span>
                <span className="text-xs text-gold-500 font-medium">{unread} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-ink-50 dark:border-ink-700/60 hover:bg-ink-50 dark:hover:bg-ink-700/40">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-50">{n.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{n.date}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { navigate('/notifications'); setNotifOpen(false) }}
                className="w-full text-center py-2.5 text-sm font-medium text-teal-600 dark:text-gold-400 hover:bg-ink-50 dark:hover:bg-ink-700/40"
              >
                View all
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold">
              {initials(user?.name || 'U')}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-ink-800 dark:text-ink-50 leading-tight">{user?.name}</p>
              <p className="text-xs text-ink-400 leading-tight">{ROLE_LABELS[user?.role]}</p>
            </div>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-ink-800 rounded-xl shadow-card-hover border border-ink-100 dark:border-ink-700 overflow-hidden py-1">
              <button
                onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-700/50"
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-700/50"
              >
                <Settings size={16} /> Settings
              </button>
              <hr className="my-1 border-ink-100 dark:border-ink-700" />
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-light dark:hover:bg-ink-700/50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
