import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  const stored = localStorage.getItem('sacco_theme')
  if (stored) return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('sacco_theme', state.theme)
    },
    setTheme(state, action) {
      state.theme = action.payload
      localStorage.setItem('sacco_theme', action.payload)
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false
    },
  },
})

export const { toggleTheme, setTheme, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = uiSlice.actions
export default uiSlice.reducer
