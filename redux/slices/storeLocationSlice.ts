/**
 * storeLocationSlice
 *
 * Single source of truth for the selected store location throughout the app.
 * Used for product display, menu fetching, cart creation, and checkout.
 *
 * Set when user confirms a branch/area in the OrderTypeModal.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface StoreLocationState {
  // Branch
  branchId: number | null
  branchName: string

  // Area (delivery: from city/area selection; pickup: first area of the branch)
  areaId: number | null
  areaName: string

  // Human-readable display label shown in the navbar
  displayLabel: string
}

const initialState: StoreLocationState = {
  branchId:     null,
  branchName:   '',
  areaId:       null,
  areaName:     '',
  displayLabel: '',
}

const storeLocationSlice = createSlice({
  name: 'storeLocation',
  initialState,
  reducers: {
    /**
     * Set the full location at once (called from OrderTypeModal on confirm).
     */
    setStoreLocation(state, action: PayloadAction<Partial<StoreLocationState>>) {
      const { branchId, branchName, areaId, areaName, displayLabel } = action.payload
      if (branchId   !== undefined) state.branchId   = branchId
      if (branchName !== undefined) state.branchName = branchName
      if (areaId     !== undefined) state.areaId     = areaId
      if (areaName   !== undefined) state.areaName   = areaName
      if (displayLabel !== undefined) state.displayLabel = displayLabel
    },

    /** Update only the area (after auto-fetch by branchId). */
    setAreaFromBranch(
      state,
      action: PayloadAction<{ areaId: number; areaName: string }>
    ) {
      state.areaId   = action.payload.areaId
      state.areaName = action.payload.areaName
    },

    clearStoreLocation() {
      return initialState
    },
  },
})

export const { setStoreLocation, setAreaFromBranch, clearStoreLocation } =
  storeLocationSlice.actions
export default storeLocationSlice.reducer
