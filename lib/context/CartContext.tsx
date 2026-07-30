'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderType = 'delivery' | 'pickup'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  selectedOption?: string
}

export interface AuthUser {
  name: string
  phone: string
  email?: string
  gender?: 'Male' | 'Female'
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

  // Location modal
  locationModalOpen: boolean
  openLocationModal: () => void
  closeLocationModal: () => void

  // Cart items
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  // Cart UI
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void

  // Computed
  totalItems: number
  subtotal: number
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined)

const LS_LOCATION   = 'uk_location'
const LS_ORDER_TYPE = 'uk_order_type'
const LS_BRANCH     = 'uk_branch'
const LS_USER       = 'uk_user'
const LS_ADDRESSES  = 'uk_addresses'

export function CartProvider({ children }: { children: ReactNode }) {
  const [orderType, setOrderTypeState] = useState<OrderType>('delivery')
  const [location, setLocationState]   = useState('')
  const [branch, setBranchState]       = useState('')
  const [user, setUserState]           = useState<AuthUser | null>(null)
  const [addresses, setAddresses]      = useState<SavedAddress[]>([])
  const [items, setItems]              = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen]    = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [hydrated, setHydrated]        = useState(false)

  // Hydrate from localStorage once on client
  useEffect(() => {
    const savedLocation  = localStorage.getItem(LS_LOCATION)   || ''
    const savedOrderType = localStorage.getItem(LS_ORDER_TYPE) as OrderType | null
    const savedBranch    = localStorage.getItem(LS_BRANCH)     || ''
    const savedUser      = localStorage.getItem(LS_USER)
    if (savedLocation)  setLocationState(savedLocation)
    if (savedOrderType) setOrderTypeState(savedOrderType)
    if (savedBranch)    setBranchState(savedBranch)
    if (savedUser) {
      try { setUserState(JSON.parse(savedUser)) } catch { /* ignore */ }
    }
    const savedAddresses = localStorage.getItem(LS_ADDRESSES)
    if (savedAddresses) {
      try { setAddresses(JSON.parse(savedAddresses)) } catch { /* ignore */ }
    }
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
  }, [])

  const setBranch = useCallback((b: string) => {
    setBranchState(b)
    localStorage.setItem(LS_BRANCH, b)
  }, [])

  const setOrderType = useCallback((type: OrderType) => {
    setOrderTypeState(type)
    localStorage.setItem(LS_ORDER_TYPE, type)
  }, [])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === newItem.id && i.selectedOption === newItem.selectedOption
      )
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.selectedOption === newItem.selectedOption
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
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
        locationModalOpen,
        openLocationModal:  () => setLocationModalOpen(true),
        closeLocationModal: () => setLocationModalOpen(false),
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart:  () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItems,
        subtotal,
      }}
    >
      {hydrated ? children : null}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
