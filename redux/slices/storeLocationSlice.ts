import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface StoreLocationState {
  // Branch
  branchId: number | null
  branchName: string

  // City (delivery: from city selection)
  cityId: number | null
  cityName: string

  // Area (delivery: from city/area selection; pickup: first area of the branch)
  areaId: number | null
  areaName: string

  // Human-readable display label shown in the navbar
  displayLabel: string
}

const initialState: StoreLocationState = {
  branchId:     null,
  branchName:   '',
  cityId:       null,
  cityName:     '',
  areaId:       null,
  areaName:     '',
  displayLabel: '',
}

const storeLocationSlice = createSlice({
  name: 'storeLocation',
  initialState,
  reducers: {
    setStoreLocation(state, action: PayloadAction<Partial<StoreLocationState>>) {
      const { branchId, branchName, cityId, cityName, areaId, areaName, displayLabel } = action.payload
      if (branchId      !== undefined) state.branchId   = branchId
      if (branchName    !== undefined) state.branchName = branchName
      if (cityId        !== undefined) state.cityId     = cityId
      if (cityName      !== undefined) state.cityName   = cityName
      if (areaId        !== undefined) state.areaId     = areaId
      if (areaName      !== undefined) state.areaName   = areaName
      if (displayLabel  !== undefined) state.displayLabel = displayLabel
    },

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
