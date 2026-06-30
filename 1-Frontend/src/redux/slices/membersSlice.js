import { createSlice } from '@reduxjs/toolkit'
import { MEMBERS } from '../../utils/mockData'

const initialState = {
  list: MEMBERS,
  loading: false,
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
})

export const { setFilters, addMember, updateMember, removeMember } = membersSlice.actions
export default membersSlice.reducer
