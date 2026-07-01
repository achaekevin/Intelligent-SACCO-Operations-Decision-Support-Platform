import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Async thunk to fetch members from API
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members')
    }
  }
)

const initialState = {
  list: [],
  loading: false,
  error: null,
  filters: { search: '', branch: '', status: '' },
}

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    addMember(state, action) {
      state.list.unshift(action.payload)
    },
    updateMember(state, action) {
      const idx = state.list.findIndex((m) => m.id === action.payload.id)
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
    },
    removeMember(state, action) {
      state.list = state.list.filter((m) => m.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, addMember, updateMember, removeMember } = membersSlice.actions
export default membersSlice.reducer
