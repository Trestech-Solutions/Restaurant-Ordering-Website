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

interface CartContextType {
  // Order setup
  orderType: OrderType
  setOrderType: (type: OrderType) => void
  location: string
  setLocation: (loc: string) => void

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

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage so values survive page navigation
  const [orderType, setOrderTypeState] = useState<OrderType>('delivery')
  const [location, setLocationState]   = useState('')
  const [items, setItems]              = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen]    = useState(false)
  const [hydrated, setHydrated]        = useState(false)

  // Hydrate from localStorage once on client
  useEffect(() => {
    const savedLocation  = localStorage.getItem(LS_LOCATION)   || ''
    const savedOrderType = localStorage.getItem(LS_ORDER_TYPE) as OrderType | null
    if (savedLocation)  setLocationState(savedLocation)
    if (savedOrderType) setOrderTypeState(savedOrderType)
    setHydrated(true)
  }, [])

  const setLocation = useCallback((loc: string) => {
    setLocationState(loc)
    localStorage.setItem(LS_LOCATION, loc)
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
        orderType,
        setOrderType,
        location,
        setLocation,
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
      {/* Don't render children until localStorage is read to avoid flicker */}
      {hydrated ? children : null}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
