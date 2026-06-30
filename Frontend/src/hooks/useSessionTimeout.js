import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { toast } from 'react-toastify'

// Logs the user out after a period of inactivity. Default 20 minutes.
export const useSessionTimeout = (timeoutMs = 20 * 60 * 1000) => {
  const { isAuthenticated, logout } = useAuth()
  const timerRef = useRef(null)

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isAuthenticated) return
    timerRef.current = setTimeout(() => {
      toast.info('Your session expired due to inactivity. Please log in again.')
      logout()
    }, timeoutMs)
  }, [isAuthenticated, logout, timeoutMs])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, reset])
}
