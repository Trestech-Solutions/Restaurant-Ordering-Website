import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type OrderType = 'delivery' | 'pickup'

interface OrderState {
  orderType: OrderType
  location: string
  branch: string        // branch ID as string (legacy, kept for compat)
  branchId: number | null  // branch ID as number — the canonical value
  areaId: number | null
  locationModalOpen: boolean
}

const initialState: OrderState = {
  orderType: 'delivery',
  location: '',
  branch: '',
  branchId: null,
  areaId: null,
  locationModalOpen: false,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderType(state, action: PayloadAction<OrderType>) {
      state.orderType = action.payload
    },
    setLocation(state, action: PayloadAction<string>) {
      state.location = action.payload
    },
    // Accepts string or number — keeps both branch (string) and branchId (number) in sync
    setBranch(state, action: PayloadAction<string | number>) {
      const raw = action.payload
      state.branch   = String(raw)
      state.branchId = raw !== '' && raw !== null ? Number(raw) : null
    },
    setAreaId(state, action: PayloadAction<number | null>) {
      state.areaId = action.payload
    },
    openLocationModal(state) {
      state.locationModalOpen = true
    },
    closeLocationModal(state) {
      state.locationModalOpen = false
    },
  },
})

export const {
  setOrderType,
  setLocation,
  setBranch,
  setAreaId,
  openLocationModal,
  closeLocationModal,
} = orderSlice.actions
export default orderSlice.reducer
