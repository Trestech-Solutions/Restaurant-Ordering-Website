'use client'

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { toast } from 'sonner'
import { getCartToken, setCartToken as persistToken } from '@/api/utils'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  addItem as reduxAddItem,
  removeItem as reduxRemoveItem,
  updateQuantity as reduxUpdateQuantity,
  clearCart as reduxClearCart,
  setCartToken as reduxSetCartToken,
  setItems as reduxSetItems,
  openCart as reduxOpenCart,
  closeCart as reduxCloseCart,
  type CartItem,
} from '@/redux/slices/cartSlice'
import {
  setUser as reduxSetUser,
  logout as reduxLogout,
  type AuthUser,
} from '@/redux/slices/authSlice'
import {
  setOrderType as reduxSetOrderType,
  setLocation as reduxSetLocation,
  setBranch as reduxSetBranch,
  setAreaId as reduxSetAreaId,
  openLocationModal as reduxOpenLocationModal,
  closeLocationModal as reduxCloseLocationModal,
  type OrderType,
} from '@/redux/slices/orderSlice'
import { useGetSettings } from '@/api/client/browse'
import type { StoreSettings } from '@/api/types'

export type { CartItem, AuthUser, OrderType }

export interface SavedAddress {
  id: string
  line1: string
  city: string
}

interface CartContextType {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void

  addresses: SavedAddress[]
  addAddress: (a: Omit<SavedAddress, 'id'>) => void
  removeAddress: (id: string) => void

  orderType: OrderType
  setOrderType: (type: OrderType) => void
  location: string
  setLocation: (loc: string) => void
  branch: string
  setBranch: (b: string | number) => void
  branchId: number | null
  areaId: number | null
  setAreaId: (id: number | null) => void

  locationModalOpen: boolean
  openLocationModal: () => void
  closeLocationModal: () => void

  items: CartItem[]
  addItem: (
    item: Omit<CartItem, 'quantity' | 'cartItemId'> & {
      variantId?: number | null
      sizeFk?: number | null
      specialInstructions?: string
      quantity?: number
    }
  ) => void
  removeItem: (item: CartItem) => void
  updateQuantity: (item: CartItem, quantity: number) => void
  clearCart: () => void
  isCartLoading: boolean

  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void

  totalItems: number
  subtotal: number
  cartToken: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function generateCartToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'local-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  const user             = useAppSelector((s) => s.auth.user)
  const reduxItems       = useAppSelector((s) => s.cart.items)
  const isCartOpen       = useAppSelector((s) => s.cart.isCartOpen)
  const reduxCartToken   = useAppSelector((s) => s.cart.cartToken)
  const orderType        = useAppSelector((s) => s.order.orderType)
  const location         = useAppSelector((s) => s.order.location)
  const branch           = useAppSelector((s) => s.order.branch)
  const branchId         = useAppSelector((s) => s.order.branchId)
  const areaId           = useAppSelector((s) => s.order.areaId)
  const locationModalOpen = useAppSelector((s) => s.order.locationModalOpen)

  const addresses: SavedAddress[] = []

  const setUser = useCallback(
    (u: AuthUser | null) => {
      if (u) dispatch(reduxSetUser(u))
      else dispatch(reduxLogout())
    },
    [dispatch]
  )

  const setOrderType = useCallback(
    (type: OrderType) => dispatch(reduxSetOrderType(type)),
    [dispatch]
  )
  const setLocation = useCallback(
    (loc: string) => {
      dispatch(reduxSetLocation(loc))
      dispatch(reduxSetItems([]))
      dispatch(reduxSetCartToken(null))
      persistToken(null)
    },
    [dispatch]
  )
  const setBranch  = useCallback((b: string | number) => dispatch(reduxSetBranch(b)), [dispatch])
  const setAreaId  = useCallback((id: number | null) => dispatch(reduxSetAreaId(id)), [dispatch])

  const numericBranch      = branchId ?? (branch ? Number(branch) : undefined)
  const numericBranchValid = numericBranch !== undefined && !isNaN(numericBranch)

  const addItem = useCallback(
    (
      item: Omit<CartItem, 'quantity' | 'cartItemId'> & {
        variantId?: number | null
        sizeFk?: number | null
        specialInstructions?: string
        quantity?: number
      }
    ) => {
      const requestedQty = item.quantity ?? 1

      // Deals use string ids like "fixed_deal_1" / "on_spot_deal_1"
      const isDeal =
        typeof item.id === 'string' &&
        (item.id.startsWith('fixed_deal_') || item.id.startsWith('on_spot_deal_'))

      const coercedId        = Number(item.id)
      const numericProductId = Number.isFinite(coercedId) && coercedId > 0 ? coercedId : null

      if (!numericBranchValid) {
        toast.error('Please select a branch first')
        dispatch(reduxOpenLocationModal())
        return
      }

      // Deals don't have a numeric product id — they are identified by their
      // string id prefix. Allow them through without the numeric check.
      if (!isDeal && numericProductId === null) {
        toast.error('This item is not available for ordering yet')
        return
      }

      dispatch(reduxAddItem({ ...item, quantity: requestedQty, cartItemId: null }))
      toast.success('Item added to cart')
      dispatch(reduxOpenCart())
    },
    [dispatch, numericBranchValid]
  )

  const removeItem = useCallback(
    (item: CartItem) => {
      dispatch(reduxRemoveItem({ id: item.id, selectedOption: item.selectedOption }))
      toast.success('Item removed from cart')
    },
    [dispatch]
  )

  const updateQuantity = useCallback(
    (item: CartItem, quantity: number) => {
      dispatch(
        reduxUpdateQuantity({ id: item.id, selectedOption: item.selectedOption, quantity })
      )
    },
    [dispatch]
  )

  const clearCart = useCallback(() => {
    dispatch(reduxClearCart())
    persistToken(null)
  }, [dispatch])

  const items: CartItem[] = reduxItems

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  let effectiveCartToken = reduxCartToken ?? getCartToken()
  if (!effectiveCartToken && items.length > 0) {
    effectiveCartToken = generateCartToken()
    dispatch(reduxSetCartToken(effectiveCartToken))
    persistToken(effectiveCartToken)
  }
  const cartToken = effectiveCartToken

  const value: CartContextType = {
    user,
    setUser,
    addresses,
    addAddress:  () => {},
    removeAddress: () => {},
    orderType,
    setOrderType,
    location,
    setLocation,
    branch,
    setBranch,
    branchId,
    areaId,
    setAreaId,
    locationModalOpen,
    openLocationModal:  () => dispatch(reduxOpenLocationModal()),
    closeLocationModal: () => dispatch(reduxCloseLocationModal()),
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isCartLoading: false,
    isCartOpen,
    openCart:  () => dispatch(reduxOpenCart()),
    closeCart: () => dispatch(reduxCloseCart()),
    totalItems,
    subtotal,
    cartToken,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function useRegisterProductId() {
  return (_clientId: string, _numericId: number) => {}
}

// ──────────────────────────────────────────────────────────────────────────
// StoreSettingsProvider — exposes the StoreSettings API response globally
// with numeric helpers + sensible defaults.
// ──────────────────────────────────────────────────────────────────────────

export const DEFAULT_DELIVERY_FEE   = 200
export const DEFAULT_TAX_RATE       = 0.18

/** Helper: parse a setting that may be "100" (string) or 100 (number) or ""/null → fallback */
function toNumber(
  v: string | number | null | undefined,
  fallback: number,
): number {
  if (v === null || v === undefined || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export interface StoreSettingsDerived extends StoreSettings {
  /** delivery_charges parsed as number; fallback = 0 (use caller's default if needed) */
  deliveryFee: number
  /** packaging_charge parsed as number; fallback = 0 */
  packagingCharge: number
  /** convenience_fee parsed as number; fallback = 0 */
  convenienceFee: number
  /** free_delivery_above_subtotal parsed as number; Infinity means "never free" */
  freeDeliveryAboveSubtotal: number
  /** delivery_time parsed as number (minutes) */
  deliveryTimeMinutes: number | null
  /** pickup_time parsed as number (minutes) */
  pickupTimeMinutes: number | null
  /** dinein_time parsed as number (minutes) */
  dineinTimeMinutes: number | null
}

interface StoreSettingsContextType {
  settings: StoreSettingsDerived
  /** Is the settings request still loading? */
  isLoading: boolean
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined)

function deriveSettings(raw: StoreSettings | undefined): StoreSettingsDerived {
  const r = (raw ?? {}) as StoreSettings
  return {
    ...r,
    deliveryFee:               toNumber(r.delivery_charges, 0),
    packagingCharge:           toNumber(r.packaging_charge, 0),
    convenienceFee:            toNumber(r.convenience_fee, 0),
    freeDeliveryAboveSubtotal: (() => {
      const n = toNumber(r.free_delivery_above_subtotal, NaN)
      return Number.isFinite(n) && n > 0 ? n : Infinity
    })(),
    deliveryTimeMinutes: (() => {
      const n = toNumber(r.delivery_time, NaN)
      return Number.isFinite(n) && n > 0 ? n : null
    })(),
    pickupTimeMinutes: (() => {
      const n = toNumber(r.pickup_time, NaN)
      return Number.isFinite(n) && n > 0 ? n : null
    })(),
    dineinTimeMinutes: (() => {
      const n = toNumber(r.dinein_time, NaN)
      return Number.isFinite(n) && n > 0 ? n : null
    })(),
  }
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const { branchId, areaId } = useCart()
  const { data, isLoading } = useGetSettings({ branchId, areaId })
  const derived = useMemo(() => deriveSettings(data), [data])
  const value = useMemo<StoreSettingsContextType>(
    () => ({ settings: derived, isLoading }),
    [derived, isLoading],
  )
  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext)
  if (!ctx) throw new Error('useStoreSettings must be used within StoreSettingsProvider')
  return ctx
}
