import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import storeLocationReducer from './slices/storeLocationSlice'

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
