import { createSlice } from '@reduxjs/toolkit'
import { NOTIFICATIONS } from '../../utils/mockData'

const initialState = {
  list: NOTIFICATIONS,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action) {
      const n = state.list.find((x) => x.id === action.payload)
      if (n) n.read = true
    },
    markAllAsRead(state) {
      state.list.forEach((n) => { n.read = true })
    },
    deleteNotification(state, action) {
      state.list = state.list.filter((x) => x.id !== action.payload)
    },
  },
})

export const { markAsRead, markAllAsRead, deleteNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
