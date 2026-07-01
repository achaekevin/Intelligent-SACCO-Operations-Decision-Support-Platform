import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import membersReducer from './slices/membersSlice'
import loansReducer from './slices/loansSlice'
import notificationsReducer from './slices/notificationsSlice'
import branchesReducer from './slices/branchesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    members: membersReducer,
    loans: loansReducer,
    notifications: notificationsReducer,
    branches: branchesReducer,
  },
})
