// frontend/src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice'; // 👈 CRITICAL FIX: Import the Cart Reducer

import { authApi } from '../api/authApi';
import { landApi } from '../api/landApi';
import { userApi } from '../api/userApi';
import { storeApi } from '../api/storeApi'; 

export const store = configureStore({
  reducer: {
    // 1. Redux Slices (Session/UI State)
    auth: authReducer,
    cart: cartReducer, // 👈 CRITICAL FIX: Register cartReducer under the 'cart' key

    // 2. RTK Query API Slices (Data Fetching, Caching)
    [authApi.reducerPath]: authApi.reducer,
    [landApi.reducerPath]: landApi.reducer,
    [userApi.reducerPath]: userApi.reducer, 
    [storeApi.reducerPath]: storeApi.reducer,
  },
  
  // Adding the api middleware is essential for RTK Query features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
        authApi.middleware, 
        landApi.middleware, 
        userApi.middleware,
        storeApi.middleware
    ),
});

// CRITICAL: Define RootState and AppDispatch types for typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;