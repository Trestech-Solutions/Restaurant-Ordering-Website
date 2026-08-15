import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
  cartToken: string | null
}

const initialState: CartState = {
  items: [],
  isCartOpen: false,
  cartToken: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
    },

    addItem(
      state,
      action: PayloadAction<
        Omit<CartItem, 'quantity' | 'cartItemId'> & {
          quantity?: number
          cartItemId?: number | null
          variantId?: number | null
          specialInstructions?: string
        }
      >
    ) {
      const { quantity = 1, cartItemId = null, ...rest } = action.payload
      const existing = state.items.find(
        (i) => i.id === rest.id && i.selectedOption === rest.selectedOption
      )
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ ...rest, quantity, cartItemId })
      }
    },

    removeItem(
      state,
      action: PayloadAction<{ id: string; selectedOption?: string }>
    ) {
      state.items = state.items.filter(
        (i) =>
          !(
            i.id === action.payload.id &&
            i.selectedOption === action.payload.selectedOption
          )
      )
    },

    updateQuantity(
      state,
      action: PayloadAction<{
        id: string
        selectedOption?: string
        quantity: number
      }>
    ) {
      const { id, selectedOption, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter(
          (i) => !(i.id === id && i.selectedOption === selectedOption)
        )
      } else {
        const item = state.items.find(
          (i) => i.id === id && i.selectedOption === selectedOption
        )
        if (item) item.quantity = quantity
      }
    },

    clearCart(state) {
      state.items = []
      state.cartToken = null
    },

    setCartToken(state, action: PayloadAction<string | null>) {
      state.cartToken = action.payload
    },

    openCart(state) {
      state.isCartOpen = true
    },

    closeCart(state) {
      state.isCartOpen = false
    },
  },
})

export const {
  setItems,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setCartToken,
  openCart,
  closeCart,
} = cartSlice.actions
export default cartSlice.reducer
