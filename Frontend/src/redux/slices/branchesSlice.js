import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Async thunk to fetch branches from API
export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches')
    }
  }
)

// Async thunk to fetch branch by ID
export const fetchBranchById = createAsyncThunk(
  'branches/fetchBranchById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/branches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch')
    }
  }
)

// Async thunk to fetch branch stats
export const fetchBranchStats = createAsyncThunk(
  'branches/fetchBranchStats',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_URL}/branches/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch stats')
    }
  }
)

const initialState = {
  list: [],
  currentBranch: null,
  currentStats: null,
  loading: false,
  error: null,
  filters: { search: '', status: '' },
}

const branchesSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    addBranch(state, action) {
      state.list.unshift(action.payload)
    },
    updateBranch(state, action) {
      const idx = state.list.findIndex((b) => b.id === action.payload.id)
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
    },
    removeBranch(state, action) {
      state.list = state.list.filter((b) => b.id !== action.payload)
    },
    clearCurrentBranch(state) {
      state.currentBranch = null
      state.currentStats = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch branches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch branch by ID
      .addCase(fetchBranchById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBranch = action.payload
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch branch stats
      .addCase(fetchBranchStats.fulfilled, (state, action) => {
        state.currentStats = action.payload
      })
  },
})

export const { setFilters, addBranch, updateBranch, removeBranch, clearCurrentBranch } = branchesSlice.actions
export default branchesSlice.reducer
