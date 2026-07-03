import { Outlet, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Landmark, Sun, Moon, LogOut } from 'lucide-react'
import { MEMBER_NAV_ITEMS } from '../constants/nav'
import { toggleTheme } from '../redux/slices/uiSlice'
import { useAuth } from '../hooks/useAuth'
import { useSessionTimeout } from '../hooks/useSessionTimeout'
import { classNames, initials } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/common/Footer'
import ImaraLogo from '../components/common/ImaraLogo'

const MemberLayout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme } = useSelector((s) => s.ui)
  const { user, logout } = useAuth()
  useSessionTimeout()

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-cream dark:bg-ink-900 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-ink-800/90 backdrop-blur border-b border-ink-100 dark:border-ink-700">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gold-400 flex items-center justify-center">
                <ImaraLogo size={20} />
              </div>
              <span className="font-display font-bold text-ink-800 dark:text-ink-50">Imara SACCO</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-lg text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold">
                {initials(user?.name || 'M')}
              </div>
              <button onClick={() => { logout(); navigate('/login') }} className="p-2 rounded-lg text-danger hover:bg-danger-light" aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-none">
            {MEMBER_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-teal-600 text-teal-600 dark:text-gold-400 dark:border-gold-400'
                      : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-100'
                  )
                }
              >
                <item.icon size={15} /> {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={3500} theme={theme} />
    </div>
  )
}

export default MemberLayout
