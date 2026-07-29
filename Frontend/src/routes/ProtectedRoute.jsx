import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../constants/roles'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const roleLower = (user?.role || '').toLowerCase()
  const isAdmin = ['sacco_admin', 'admin', 'system_admin', 'super_admin', 'system administrator'].includes(roleLower)

  // Members are routed to the member portal, not the staff dashboard
  if (roleLower === ROLES.MEMBER && !location.pathname.startsWith('/portal')) {
    return <Navigate to="/portal" replace />
  }

  // Admins always have access to all staff dashboard routes
  if (allowedRoles && !allowedRoles.includes(user?.role) && !allowedRoles.includes(roleLower) && !isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
