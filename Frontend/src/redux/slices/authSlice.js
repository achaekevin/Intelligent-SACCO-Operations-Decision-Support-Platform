import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

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
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!storedUser && !!localStorage.getItem('accessToken'),
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
      localStorage.setItem('accessToken', action.payload.token)
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
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('sacco_user')
    },
    updateProfileState(state, action) {
      state.user = { ...state.user, ...action.payload }
      if (localStorage.getItem('sacco_user')) {
        localStorage.setItem('sacco_user', JSON.stringify(state.user))
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfileState } = authSlice.actions

// Real API login
export const loginUser = ({ email, password, rememberMe }) => async (dispatch) => {
  dispatch(loginStart())
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password })
    const { user, accessToken } = response.data.data
    
    dispatch(loginSuccess({ 
      user, 
      token: accessToken, 
      rememberMe 
    }))
    return user
  } catch (error) {
    const message = error.response?.data?.message || 'Invalid email or password'
    dispatch(loginFailure(message))
    throw new Error(message)
  }
}

// Real API profile update
export const updateProfile = (profileData) => async (dispatch, getState) => {
  const token = getState().auth.token || localStorage.getItem('accessToken')
  const userId = getState().auth.user?.id
  
  try {
    const response = await axios.put(
      `${API_URL}/users/${userId}`,
      profileData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    dispatch(updateProfileState(response.data.data))
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile')
  }
}

export default authSlice.reducer
