import axios from 'axios'

// Point this to your real backend when ready. The app currently runs
// entirely on mock data (see src/utils/mockData.js) so the UI works
// out of the box with no backend required.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('sacco_user') || sessionStorage.getItem('sacco_user')
  if (stored) {
    config.headers.Authorization = 'Bearer mock-jwt-token'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sacco_user')
      sessionStorage.removeItem('sacco_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
