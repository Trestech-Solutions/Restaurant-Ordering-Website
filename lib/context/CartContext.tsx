'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react'
import {
  useGetCart,
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
} from '@/api/client/cart'
import { getCartToken, setCartToken } from '@/api/utils'
import type { Cart as ApiCart, CartItem as ApiCartItem } from '@/api/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderType = 'delivery' | 'pickup'

export interface CartItem {
  id: string
  productId: number | null
  cartItemId: number | null
  name: string
  price: number
  image: string
  quantity: number
  selectedOption?: string
  variantId?: number | null
  specialInstructions?: string
}

export interface AuthUser {
  name: string
  phone: string
  email?: string
  gender?: 'Male' | 'Female' | 'Other'
}

export interface SavedAddress {
  id: string
  line1: string
  city: string
}

interface CartContextType {
  // Auth
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void

  // Addresses
  addresses: SavedAddress[]
  addAddress: (a: Omit<SavedAddress, 'id'>) => void
  removeAddress: (id: string) => void

  // Order setup
  orderType: OrderType
  setOrderType: (type: OrderType) => void
  location: string
  setLocation: (loc: string) => void
  branch: string
  setBranch: (b: string) => void
  areaId: number | null
  setAreaId: (id: number | null) => void

  // Location modal
  locationModalOpen: boolean
  openLocationModal: () => void
  closeLocationModal: () => void

  // Cart items
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { variantId?: number | null; specialInstructions?: string; quantity?: number }) => void
  removeItem: (item: CartItem) => void
  updateQuantity: (item: CartItem, quantity: number) => void
  clearCart: () => void
  isCartLoading: boolean

  // Cart UI
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void

  // Computed
  totalItems: number
  subtotal: number
  // The live cart token from the API (undefined if no API cart yet)
  cartToken: string | null
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_LOCATION   = 'uk_location'
const LS_ORDER_TYPE = 'uk_order_type'
const LS_BRANCH     = 'uk_branch'
const LS_AREA_ID    = 'uk_area_id'
const LS_USER       = 'uk_user'
const LS_ADDRESSES  = 'uk_addresses'
const LS_LOCAL_ITEMS = 'uk_cart_items'

function parseNumberOrNull(v: string | null): number | null {
  if (v === null) return null
  const n = parseInt(v, 10)
  return isNaN(n) ? null : n
}

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

function loadLocalItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(LS_LOCAL_ITEMS)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveLocalItems(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_LOCAL_ITEMS, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  // ─── Non-cart state (local storage backed) ─────────────────────────────────
  const [orderType, setOrderTypeState] = useState<OrderType>('delivery')
  const [location, setLocationState]   = useState('')
  const [branch, setBranchState]       = useState('')
  const [areaId, setAreaIdState]       = useState<number | null>(null)
  const [user, setUserState]           = useState<AuthUser | null>(null)
  const [addresses, setAddresses]      = useState<SavedAddress[]>([])
  const [isCartOpen, setIsCartOpen]    = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [hydrated, setHydrated]        = useState(false)

  // ─── Local fallback items (used when API cart unavailable) ────────────────
  const [localItems, setLocalItems] = useState<CartItem[]>([])

  // ─── Product ID map: client-side id (slug/string) => numeric product id ───
  const [idMap, setIdMap] = useState<Record<string, number>>({})

  const registerProductId = useCallback((clientId: string, numericId: number) => {
    setIdMap((prev) => {
      if (prev[clientId] === numericId) return prev
      return { ...prev, [clientId]: numericId }
    })
  }, [])

  // ─── Hydrate from localStorage once on client ─────────────────────────────
  useEffect(() => {
    const savedLocation  = localStorage.getItem(LS_LOCATION)   || ''
    const savedOrderType = localStorage.getItem(LS_ORDER_TYPE) as OrderType | null
    const savedBranch    = localStorage.getItem(LS_BRANCH)     || ''
    const savedAreaIdRaw = localStorage.getItem(LS_AREA_ID)
    const savedUser      = localStorage.getItem(LS_USER)
    if (savedLocation)  setLocationState(savedLocation)
    if (savedOrderType) setOrderTypeState(savedOrderType)
    if (savedBranch)    setBranchState(savedBranch)
    const parsedArea = parseNumberOrNull(savedAreaIdRaw)
    if (parsedArea !== null) setAreaIdState(parsedArea)
    if (savedUser) {
      try { setUserState(JSON.parse(savedUser)) } catch { /* ignore */ }
    }
    const savedAddresses = localStorage.getItem(LS_ADDRESSES)
    if (savedAddresses) {
      try { setAddresses(JSON.parse(savedAddresses)) } catch { /* ignore */ }
    }
    setLocalItems(loadLocalItems())
    setHydrated(true)
  }, [])

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u)
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u))
    else   localStorage.removeItem(LS_USER)
  }, [])

  const addAddress = useCallback((a: Omit<SavedAddress, 'id'>) => {
    setAddresses((prev) => {
      const next = [...prev, { ...a, id: Date.now().toString() }]
      localStorage.setItem(LS_ADDRESSES, JSON.stringify(next))
      return next
    })
  }, [])

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id)
      localStorage.setItem(LS_ADDRESSES, JSON.stringify(next))
      return next
    })
  }, [])

  const setLocation = useCallback((loc: string) => {
    setLocationState(loc)
    localStorage.setItem(LS_LOCATION, loc)
    setLocalItems([])
    saveLocalItems([])
  }, [])

  const setBranch = useCallback((b: string) => {
    setBranchState(b)
    localStorage.setItem(LS_BRANCH, b)
  }, [])

  const setAreaId = useCallback((id: number | null) => {
    setAreaIdState(id)
    if (id !== null) localStorage.setItem(LS_AREA_ID, String(id))
    else localStorage.removeItem(LS_AREA_ID)
  }, [])

  const setOrderType = useCallback((type: OrderType) => {
    setOrderTypeState(type)
    localStorage.setItem(LS_ORDER_TYPE, type)
  }, [])

  // ─── Cart API hooks ────────────────────────────────────────────────────────
  const cartToken = getCartToken()
  const hasApiToken = !!cartToken

  const { data: apiCart, isLoading: cartLoading } = useGetCart({
    cartToken,
  })

  // Persist the API cart token to localStorage whenever we receive a cart
  useEffect(() => {
    if (apiCart?.token && apiCart.token !== getCartToken()) {
      setCartToken(apiCart.token)
    }
  }, [apiCart?.token])

  const addToCartMutation = useAddToCart()
  const updateQuantityMutation = useUpdateCartQuantity()
  const removeItemMutation = useRemoveCartItem()

  const numericBranch = branch ? Number(branch) : undefined
  const numericBranchValid = numericBranch !== undefined && !isNaN(numericBranch)

  // ─── Merge API cart items + local items ────────────────────────────────────
  const items: CartItem[] = useMemo(() => {
    const apiItems = apiCart?.items ? apiItemsToLocal(apiCart.items) : []
    if (apiItems.length > 0) return apiItems
    return localItems
  }, [apiCart, localItems])

  const isCartLoading = cartLoading

  // ─── Cart operations ───────────────────────────────────────────────────────
  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { variantId?: number | null; specialInstructions?: string; quantity?: number }) => {
      const requestedQty = item.quantity ?? 1
      const numericProductId =
        item.productId ?? idMap[item.id] ?? parseNumberOrNull(item.id)

      const canUseApi =
        numericProductId !== null &&
        !isNaN(numericProductId) &&
        numericBranchValid

      if (canUseApi) {
        // Try API add first
        addToCartMutation.addToCart({
          product: numericProductId,
          quantity: requestedQty,
          variant: item.variantId ?? undefined,
          branch: numericBranch,
          area: areaId ?? undefined,
          special_instructions: item.specialInstructions,
        })
        setIsCartOpen(true)
        return
      }

      // Fallback: local state
      setLocalItems((prev) => {
        const existing = prev.find(
          (i) => i.id === item.id && i.selectedOption === item.selectedOption
        )
        let next: CartItem[]
        if (existing) {
          next = prev.map((i) =>
            i.id === item.id && i.selectedOption === item.selectedOption
              ? { ...i, quantity: i.quantity + requestedQty }
              : i
          )
        } else {
          next = [
            ...prev,
            {
              id: item.id,
              productId: item.productId ?? null,
              cartItemId: null,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: requestedQty,
              selectedOption: item.selectedOption,
              variantId: item.variantId ?? null,
              specialInstructions: item.specialInstructions,
            },
          ]
        }
        saveLocalItems(next)
        return next
      })
      setIsCartOpen(true)
    },
    [addToCartMutation, numericBranchValid, numericBranch, areaId, idMap]
  )

  const removeItem = useCallback(
    (item: CartItem) => {
      // Operate via API if we have a cart_item_id
      if (item.cartItemId !== null) {
        removeItemMutation.removeItem({ cart_item_id: item.cartItemId })
        return
      }
      // Local fallback: match by (id + selectedOption) to handle variants
      setLocalItems((prev) => {
        const next = prev.filter(
          (i) =>
            !(i.id === item.id && i.selectedOption === item.selectedOption)
        )
        saveLocalItems(next)
        return next
      })
    },
    [removeItemMutation]
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
      // Local fallback: match by (id + selectedOption)
      setLocalItems((prev) => {
        let next: CartItem[]
        if (quantity <= 0) {
          next = prev.filter(
            (i) =>
              !(i.id === item.id && i.selectedOption === item.selectedOption)
          )
        } else {
          next = prev.map((i) =>
            i.id === item.id && i.selectedOption === item.selectedOption
              ? { ...i, quantity }
              : i
          )
        }
        saveLocalItems(next)
        return next
      })
    },
    [updateQuantityMutation, removeItemMutation]
  )

  const clearCart = useCallback(() => {
    setLocalItems([])
    saveLocalItems([])
    setCartToken(null)
  }, [])

  // ─── Computed ──────────────────────────────────────────────────────────────
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Sync API cart subtotal if available from backend
  const effectiveSubtotal =
    apiCart && apiCart.subtotal !== undefined
      ? Math.round(parseFloat(String(apiCart.subtotal)))
      : subtotal

  // ─── Value ─────────────────────────────────────────────────────────────────
  const value: CartContextType = {
    user,
    setUser,
    addresses,
    addAddress,
    removeAddress,
    orderType,
    setOrderType,
    location,
    setLocation,
    branch,
    setBranch,
    areaId,
    setAreaId,
    locationModalOpen,
    openLocationModal:  () => setLocationModalOpen(true),
    closeLocationModal: () => setLocationModalOpen(false),
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isCartLoading,
    isCartOpen,
    openCart:  () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    totalItems,
    subtotal: effectiveSubtotal,
    cartToken: apiCart?.token ?? getCartToken(),
  }

  // Expose registerProductId via a custom property on the context object
  ;(value as any).__registerProductId = registerProductId

  return (
    <CartContext.Provider value={value}>
      {hydrated ? children : null}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function useRegisterProductId() {
  const ctx = useContext(CartContext)
  return (ctx as any).__registerProductId as (clientId: string, numericId: number) => void
}
