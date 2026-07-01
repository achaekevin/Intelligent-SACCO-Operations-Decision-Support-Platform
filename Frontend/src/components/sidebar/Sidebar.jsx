import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronsLeft, ChevronsRight, X, Landmark, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../../constants/nav'
import { ROUTE_ACCESS } from '../../constants/roles'
import { toggleSidebar, closeMobileSidebar } from '../../redux/slices/uiSlice'
import { useAuth } from '../../hooks/useAuth'
import { classNames } from '../../utils/format'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector((s) => s.ui)
  const { user, logout } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => {
    const allowed = ROUTE_ACCESS[item.key]
    return !allowed || allowed.includes(user?.role)
  })

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-900/50 z-30 lg:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
          aria-hidden="true"
        />
      )}
      <aside
        className={classNames(
          'fixed lg:sticky top-0 left-0 h-screen z-40 flex flex-col',
          'bg-ink-800 text-ink-50 transition-all duration-200 ease-out',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'w-64',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-ink-700/60 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gold-400 flex items-center justify-center shrink-0">
              <Landmark size={18} className="text-ink-900" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-lg tracking-tight whitespace-nowrap">Amana SACCO</span>
            )}
          </div>
          <button
            className="lg:hidden text-ink-200 hover:text-white"
            onClick={() => dispatch(closeMobileSidebar())}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none py-3 px-2">
          <ul className="space-y-1">
            {visibleItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={({ isActive }) =>
                    classNames(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-ink-200 hover:bg-ink-700 hover:text-white'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon size={19} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-ink-700/60 p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={19} className="shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-center border-t border-ink-700/60 py-3">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="text-ink-300 hover:text-gold-400 p-2 rounded-lg hover:bg-ink-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
