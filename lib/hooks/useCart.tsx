'use client'

/**
 * CartContext — thin bridge over Redux.
 *
 * All persistent state (user, cart items, order setup) now lives in Redux
 * (with redux-persist). This context keeps the same useCart() API so every
 * existing call-site works without change.
 *
 * React-Query cart API calls (useGetCart, useAddToCart …) still live here
 * because they are async side-effects, not pure state.
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import {
  useGetCart,
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
} from '@/api/client/cart'
import { getCartToken, setCartToken as persistToken } from '@/api/utils'
import type { Cart as ApiCart, CartItem as ApiCartItem } from '@/api/types'
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

// ─── Re-exports so consumers can import types from here ───────────────────────
export type { CartItem, AuthUser, OrderType }

export interface SavedAddress {
  id: string
  line1: string
  city: string
}

// ─── Context interface — identical to the original ────────────────────────────

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

// ─── helpers ──────────────────────────────────────────────────────────────────

function apiItemsToLocal(items: ApiCartItem[]): CartItem[] {
  return items.map((it) => ({
    id: `api-${it.id}`,
    productId: it.product,
    cartItemId: it.id,
    name: it.product_name,
    price: Math.round(parseFloat(String(it.unit_price ?? '0'))),
    image: it.product_image || '',
    quantity: it.quantity,
    selectedOption: it.variant_name || undefined,
    variantId: it.variant ?? null,
  }))
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  // ─── Redux selectors ──────────────────────────────────────────────────────
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

  // Addresses still live in Redux cart slice (via a separate key if needed)
  // For now we derive them from a local key — kept simple since they come from API
  const addresses: SavedAddress[] = []

  // ─── Cart API ─────────────────────────────────────────────────────────────
  const storedToken = reduxCartToken ?? getCartToken()
  const { data: apiCart, isLoading: cartLoading } = useGetCart({
    cartToken: storedToken,
  })

  // Sync API token back to Redux + localStorage
  useEffect(() => {
    if (apiCart?.token && apiCart.token !== storedToken) {
      dispatch(reduxSetCartToken(apiCart.token))
      persistToken(apiCart.token)
    }
  }, [apiCart?.token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync API cart items to Redux
  useEffect(() => {
    if (apiCart?.items && apiCart.items.length > 0) {
      dispatch(reduxSetItems(apiItemsToLocal(apiCart.items)))
    }
  }, [apiCart?.items]) // eslint-disable-line react-hooks/exhaustive-deps

  const addToCartMutation      = useAddToCart()
  const updateQuantityMutation = useUpdateCartQuantity()
  const removeItemMutation     = useRemoveCartItem()

  const numericBranch      = branchId ?? (branch ? Number(branch) : undefined)
  const numericBranchValid = numericBranch !== undefined && !isNaN(numericBranch)

  // ─── Merge: prefer API items if available ────────────────────────────────
  const items: CartItem[] = useMemo(() => {
    const apiItems = apiCart?.items ? apiItemsToLocal(apiCart.items) : []
    return apiItems.length > 0 ? apiItems : reduxItems
  }, [apiCart, reduxItems])

  // ─── Auth ────────────────────────────────────────────────────────────────
  const setUser = useCallback(
    (u: AuthUser | null) => {
      if (u) dispatch(reduxSetUser(u))
      else dispatch(reduxLogout())
    },
    [dispatch]
  )

  // ─── Order setup ─────────────────────────────────────────────────────────
  const setOrderType = useCallback(
    (type: OrderType) => dispatch(reduxSetOrderType(type)),
    [dispatch]
  )
  const setLocation = useCallback(
    (loc: string) => {
      dispatch(reduxSetLocation(loc))
      // Clear cart when location changes
      dispatch(reduxSetItems([]))
      dispatch(reduxSetCartToken(null))
      persistToken(null)
    },
    [dispatch]
  )
  const setBranch  = useCallback((b: string) => dispatch(reduxSetBranch(b)), [dispatch])
  const setAreaId  = useCallback((id: number | null) => dispatch(reduxSetAreaId(id)), [dispatch])

  // ─── Cart operations ─────────────────────────────────────────────────────
  const addItem = useCallback(
    (
      item: Omit<CartItem, 'quantity' | 'cartItemId'> & {
        variantId?: number | null
        specialInstructions?: string
        quantity?: number
      }
    ) => {
      const requestedQty    = item.quantity ?? 1
      const numericProductId = item.productId ?? null
      const canUseApi =
        numericProductId !== null &&
        !isNaN(numericProductId) &&
        numericBranchValid

      if (canUseApi) {
        addToCartMutation.addToCart({
          product:               numericProductId,
          quantity:              requestedQty,
          variant:               item.variantId ?? undefined,
          branch:                numericBranch,
          area:                  areaId ?? undefined,
          special_instructions:  item.specialInstructions,
        })
        dispatch(reduxOpenCart())
        return
      }

      // Local fallback
      dispatch(reduxAddItem({ ...item, quantity: requestedQty, cartItemId: null }))
      dispatch(reduxOpenCart())
    },
    [dispatch, addToCartMutation, numericBranchValid, numericBranch, areaId]
  )

  const removeItem = useCallback(
    (item: CartItem) => {
      if (item.cartItemId !== null) {
        removeItemMutation.removeItem({ cart_item_id: item.cartItemId })
        return
      }
      dispatch(reduxRemoveItem({ id: item.id, selectedOption: item.selectedOption }))
    },
    [dispatch, removeItemMutation]
  )

  const updateQuantity = useCallback(
    (item: CartItem, quantity: number) => {
      if (item.cartItemId !== null) {
        if (quantity <= 0) {
          removeItemMutation.removeItem({ cart_item_id: item.cartItemId })
        } else {
          updateQuantityMutation.updateQuantity({
            cart_item_id: item.cartItemId,
            payload: { quantity },
          })
        }
        return
      }
      dispatch(
        reduxUpdateQuantity({ id: item.id, selectedOption: item.selectedOption, quantity })
      )
    },
    [dispatch, updateQuantityMutation, removeItemMutation]
  )

  const clearCart = useCallback(() => {
    dispatch(reduxClearCart())
    persistToken(null)
  }, [dispatch])

  // ─── Computed ────────────────────────────────────────────────────────────
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const effectiveSubtotal =
    apiCart?.subtotal !== undefined
      ? Math.round(parseFloat(String(apiCart.subtotal)))
      : subtotal

  const cartToken = reduxCartToken ?? getCartToken()

  // ─── Value ────────────────────────────────────────────────────────────────
  const value: CartContextType = {
    user,
    setUser,
    addresses,
    addAddress:  () => {},   // managed via API (useAddAddress hook)
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
    isCartLoading: cartLoading,
    isCartOpen,
    openCart:  () => dispatch(reduxOpenCart()),
    closeCart: () => dispatch(reduxCloseCart()),
    totalItems,
    subtotal: effectiveSubtotal,
    cartToken,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

// ─── Legacy ───────────────────────────────────────────────────────────────────

export function useRegisterProductId() {
  // No-op — product IDs now come directly from API menu data
  return (_clientId: string, _numericId: number) => {}
}
