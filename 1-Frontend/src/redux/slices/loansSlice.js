import { createSlice } from '@reduxjs/toolkit'
import { LOANS } from '../../utils/mockData'

const initialState = {
  list: LOANS,
  loading: false,
  filters: { search: '', status: '', branch: '' },
}

const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    addLoan(state, action) {
      state.list.unshift(action.payload)
    },
    updateLoanStatus(state, action) {
      const { id, status } = action.payload
      const idx = state.list.findIndex((l) => l.id === id)
      if (idx !== -1) state.list[idx].status = status
    },
  },
})

export const { setFilters, addLoan, updateLoanStatus } = loansSlice.actions
export default loansSlice.reducer
