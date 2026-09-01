import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, type WebStorage } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import storeLocationReducer from './slices/storeLocationSlice'

const createNoopStorage = (): WebStorage => ({
  getItem: () => Promise.resolve(null),
  setItem: (_key, value) => Promise.resolve(value as any),
  removeItem: () => Promise.resolve(),
})

const storage: WebStorage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage()

const rootReducer = combineReducers({
  auth:          authReducer,
  cart:          cartReducer,
  order:         orderReducer,
  storeLocation: storeLocationReducer,
})

const persistConfig = {
  key: 'restaurant-root',
  storage,
  whitelist: ['auth', 'cart', 'order', 'storeLocation'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
