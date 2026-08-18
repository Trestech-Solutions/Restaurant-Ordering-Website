'use client'

/**
 * CartContext — now uses REAL APIs ONLY.
 *
 * Local Redux state management for cart operations (add/remove/update items)
 * is commented out. All cart operations go through the backend API now.
 *
 * Redux is still used for:
 *  - auth user (via authSlice)
 *  - order setup (orderType, location, branch, area) via orderSlice
 *  - UI state (isCartOpen flag) + cartToken storage via cartSlice
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useGetCart,
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
  CART_QUERY_KEY,
} from '@/api/client/cart'
import { getCartToken, setCartToken as persistToken } from '@/api/utils'
import type { Cart as ApiCart, CartItem as ApiCartItem } from '@/api/types'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  // ─── Commented out: Redux local cart item management ───
  // addItem as reduxAddItem,
  // removeItem as reduxRemoveItem,
  // updateQuantity as reduxUpdateQuantity,
  // clearCart as reduxClearCart,
  setCartToken as reduxSetCartToken,
  // setItems as reduxSetItems,
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

function apiItemsToLocal(items: ApiCartItem[]): CartItem[] {
  return items.map((it) => ({
    id: `api-${it.id}`,
    productId: it.item,
    cartItemId: it.id,
    name: it.item_name,
    price: Math.round(parseFloat(String(it.unit_price ?? '0'))),
    image: '',
    quantity: it.quantity,
    selectedOption: it.size_detail?.name || undefined,
    variantId: it.size ?? null,
  }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  // ─── Redux selectors ──────────────────────────────────────────────────────
  const user             = useAppSelector((s) => s.auth.user)
  /* ─── Commented out: Redux local cart items source ───
  const reduxItems       = useAppSelector((s) => s.cart.items)
  */
  const isCartOpen       = useAppSelector((s) => s.cart.isCartOpen)
  const reduxCartToken   = useAppSelector((s) => s.cart.cartToken)
  const orderType        = useAppSelector((s) => s.order.orderType)
  const location         = useAppSelector((s) => s.order.location)
  const branch           = useAppSelector((s) => s.order.branch)
  const branchId         = useAppSelector((s) => s.order.branchId)
  const areaId           = useAppSelector((s) => s.order.areaId)
  const locationModalOpen = useAppSelector((s) => s.order.locationModalOpen)

  const addresses: SavedAddress[] = []

  // ─── Cart API ─────────────────────────────────────────────────────────────
  const storedToken = reduxCartToken ?? getCartToken()
  const { data: apiCart, isLoading: cartLoading, refetch: refetchCart } = useGetCart({
    cartToken: storedToken,
  })

  // Sync API token back to Redux + localStorage (storage only, not for state logic)
  useEffect(() => {
    if (apiCart?.token && apiCart.token !== storedToken) {
      dispatch(reduxSetCartToken(apiCart.token))
      persistToken(apiCart.token)
    }
  }, [apiCart?.token]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Commented out: Sync API cart items back to Redux local state ───
  useEffect(() => {
    if (apiCart?.items && apiCart.items.length > 0) {
      dispatch(reduxSetItems(apiItemsToLocal(apiCart.items)))
    }
  }, [apiCart?.items]) // eslint-disable-line react-hooks/exhaustive-deps
  */

  const addToCartMutation      = useAddToCart({
    onSuccess: () => {
      refetchCart()
    },
  })
  const updateQuantityMutation = useUpdateCartQuantity({
    onSuccess: () => {
      refetchCart()
    },
  })
  const removeItemMutation     = useRemoveCartItem({
    onSuccess: () => {
      refetchCart()
    },
  })

  const numericBranch      = branchId ?? (branch ? Number(branch) : undefined)
  const numericBranchValid = numericBranch !== undefined && !isNaN(numericBranch)

  // ─── Items: ONLY from API response (Redux local items commented out) ───
  const items: CartItem[] = useMemo(() => {
    return apiCart?.items ? apiItemsToLocal(apiCart.items) : []
    /* ─── Commented out: Redux local items fallback ───
    const apiItems = apiCart?.items ? apiItemsToLocal(apiCart.items) : []
    return apiItems.length > 0 ? apiItems : reduxItems
    */
  }, [apiCart])

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
      /* ─── Commented out: Redux local clear ───
      dispatch(reduxSetItems([]))
      */
      dispatch(reduxSetCartToken(null))
      persistToken(null)
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    [dispatch, queryClient]
  )
  const setBranch  = useCallback((b: string | number) => dispatch(reduxSetBranch(b)), [dispatch])
  const setAreaId  = useCallback((id: number | null) => dispatch(reduxSetAreaId(id)), [dispatch])

  // ─── Cart operations — ONLY real APIs, Redux fallback commented out ───
  const addItem = useCallback(
    (
      item: Omit<CartItem, 'quantity' | 'cartItemId'> & {
        variantId?: number | null
        specialInstructions?: string
        quantity?: number
      }
    ) => {
      const requestedQty  = item.quantity ?? 1
      const coercedId     = Number(item.id)
      const numericProductId = Number.isFinite(coercedId) && coercedId > 0 ? coercedId : null

      if (!numericBranchValid) {
        toast.error('Please select a branch first')
        dispatch(reduxOpenLocationModal())
        return
      }

      if (numericProductId === null) {
        toast.error('This item is not available for ordering yet')
        return
      }

      addToCartMutation.addToCart({
        item:     numericProductId,
        branch:   numericBranch!,
        quantity: requestedQty,
        area:     areaId ?? undefined,
        size:     item.variantId !== null && item.variantId !== undefined
          ? Number(item.variantId) || undefined
          : undefined,
        notes:    item.specialInstructions ?? undefined,
      })

      dispatch(reduxOpenCart())

      /* ─── Commented out: Local Redux fallback ───
      dispatch(reduxAddItem({ ...item, quantity: requestedQty, cartItemId: null }))
      dispatch(reduxOpenCart())
      */
    },
    [dispatch, addToCartMutation, numericBranchValid, numericBranch, areaId]
  )

  const removeItem = useCallback(
    (item: CartItem) => {
      if (item.cartItemId === null || item.cartItemId === undefined) {
        toast.error('Cannot remove: item not synced with server')
        return
      }
      removeItemMutation.removeItem({ cart_item_id: item.cartItemId })

      /* ─── Commented out: Local Redux fallback ───
      dispatch(reduxRemoveItem({ id: item.id, selectedOption: item.selectedOption }))
      */
    },
    [dispatch, removeItemMutation]
  )

  const updateQuantity = useCallback(
    (item: CartItem, quantity: number) => {
      if (item.cartItemId === null || item.cartItemId === undefined) {
        toast.error('Cannot update: item not synced with server')
        return
      }
      if (quantity <= 0) {
        removeItemMutation.removeItem({ cart_item_id: item.cartItemId })
      } else {
        updateQuantityMutation.updateQuantity({
          cart_item_id: item.cartItemId,
          payload: { quantity },
        })
      }

      /* ─── Commented out: Local Redux fallback ───
      dispatch(
        reduxUpdateQuantity({ id: item.id, selectedOption: item.selectedOption, quantity })
      )
      */
    },
    [dispatch, updateQuantityMutation, removeItemMutation]
  )

  const clearCart = useCallback(() => {
    /* ─── Commented out: Redux local clear ───
    dispatch(reduxClearCart())
    */
    dispatch(reduxSetCartToken(null))
    persistToken(null)
    queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    void refetchCart()
  }, [dispatch, queryClient, refetchCart])

  // ─── Computed ────────────────────────────────────────────────────────────
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const effectiveSubtotal =
    apiCart?.subtotal !== undefined
      ? Math.round(parseFloat(String(apiCart.subtotal)))
      : subtotal

  const cartToken = reduxCartToken ?? getCartToken()

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

export function useRegisterProductId() {
  return (_clientId: string, _numericId: number) => {}
}
