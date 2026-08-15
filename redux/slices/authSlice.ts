import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  name: string
  phone: string
  email?: string
  gender?: 'Male' | 'Female' | 'Other'
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
    },
  },
})

export const { setUser, setTokens, logout } = authSlice.actions
export default authSlice.reducer
