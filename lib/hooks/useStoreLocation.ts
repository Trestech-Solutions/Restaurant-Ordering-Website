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
    branchId:     storeLocation.branchId,
    branchName:   storeLocation.branchName,
    cityId:       storeLocation.cityId,
    cityName:     storeLocation.cityName,
    areaId:       storeLocation.areaId,
    areaName:     storeLocation.areaName,
    displayLabel: storeLocation.displayLabel,

    setStoreLocation: (payload: Partial<StoreLocationState>) =>
      dispatch(setStoreLocation(payload)),

    setAreaFromBranch: (areaId: number, areaName: string) =>
      dispatch(setAreaFromBranch({ areaId, areaName })),

    clearStoreLocation: () => dispatch(clearStoreLocation()),
  }
}
