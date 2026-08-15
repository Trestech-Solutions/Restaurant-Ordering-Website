/**
 * useStoreLocation
 *
 * Read the selected store location (branchId, areaId, etc.) from Redux.
 * Use this anywhere in the app to get the active branch/area for:
 *  - menu fetching
 *  - product display filtering
 *  - cart creation
 *  - checkout payload
 */

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  setStoreLocation,
  setAreaFromBranch,
  clearStoreLocation,
  type StoreLocationState,
} from '@/redux/slices/storeLocationSlice'

export function useStoreLocation() {
  const dispatch = useAppDispatch()
  const storeLocation = useAppSelector((s) => s.storeLocation)

  return {
    // State
    branchId:     storeLocation.branchId,
    branchName:   storeLocation.branchName,
    areaId:       storeLocation.areaId,
    areaName:     storeLocation.areaName,
    displayLabel: storeLocation.displayLabel,

    // Actions
    setStoreLocation: (payload: Partial<StoreLocationState>) =>
      dispatch(setStoreLocation(payload)),

    setAreaFromBranch: (areaId: number, areaName: string) =>
      dispatch(setAreaFromBranch({ areaId, areaName })),

    clearStoreLocation: () => dispatch(clearStoreLocation()),
  }
}
