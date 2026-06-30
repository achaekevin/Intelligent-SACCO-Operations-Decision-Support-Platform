import { createSlice } from '@reduxjs/toolkit'
import { MOCK_USERS } from '../../utils/mockData'

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('sacco_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

const initialState = {
  user: storedUser,
  token: storedUser ? 'mock-jwt-token' : null,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
  rememberMe: !!storedUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action) {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.rememberMe = action.payload.rememberMe
      const storage = action.payload.rememberMe ? localStorage : sessionStorage
      storage.setItem('sacco_user', JSON.stringify(action.payload.user))
    },
    loginFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('sacco_user')
      sessionStorage.removeItem('sacco_user')
    },
    updateProfile(state, action) {
      state.user = { ...state.user, ...action.payload }
      if (localStorage.getItem('sacco_user')) {
        localStorage.setItem('sacco_user', JSON.stringify(state.user))
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions

// Thunk-like async action using mock data (no real API)
export const loginUser = ({ email, password, rememberMe }) => (dispatch) => {
  dispatch(loginStart())
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (user) {
        const { password: _pw, ...safeUser } = user
        dispatch(loginSuccess({ user: safeUser, token: 'mock-jwt-token', rememberMe }))
        resolve(safeUser)
      } else {
        dispatch(loginFailure('Invalid email or password'))
        reject(new Error('Invalid email or password'))
      }
    }, 600)
  })
}

export default authSlice.reducer
