// frontend/src/api/storeApi.ts (UPDATED AND CORRECTED)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
// Assuming these types are defined in your global types file
import { Product, Order, OrderItem } from '../types'; 

const BASE_URL = 'http://localhost:8000/api/';

// Custom base query that injects the JWT token
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; 
    if (token) { 
        headers.set('Authorization', `Bearer ${token}`); 
    }
    return headers;
  },
});

export const storeApi = createApi({
  reducerPath: 'storeApi',
  baseQuery: baseQueryWithAuth,
  // Define tags for caching and invalidation
  tagTypes: ['Products', 'Orders'],
  endpoints: (builder) => ({
    
    // --- 1. PRODUCT CATALOG (READ ALL) ---
    getProducts: builder.query<Product[], void>({
      query: () => 'store/products',
      providesTags: ['Products'],
    }),

    // --- 2. PRODUCT CRUD (LANDOWNER/ADMIN) ---
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: 'store/products/admin',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'], 
    }),

    updateProduct: builder.mutation<Product, { productId: string, updates: Partial<Product> }>({
      query: ({ productId, updates }) => ({
        url: `store/products/admin/${productId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { productId }) => [
        'Products', 
        { type: 'Products', id: productId }
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
        // NOTE: Fixed template literal for productId
        query: (productId) => ({
            url: `store/products/admin/${productId}`, // Corrected from 'store/products/admin/${productId}'
            method: 'DELETE',
        }),
        invalidatesTags: ['Products'], 
    }),

    // --- 3. ORDER MANAGEMENT (FARMER) ---
    
    placeOrder: builder.mutation<any, { items: OrderItem[], total_amount: number }>({
        query: (orderData) => ({
            url: 'store/orders',
            method: 'POST',
            body: orderData, // <<< 🌟 THE CRITICAL FIX IS HERE 🌟
        }),
        invalidatesTags: ['Orders'], 
    }),

    // GET /api/store/orders/user (Farmer's Order History)
    getUserOrders: builder.query<Order[], void>({
        query: () => 'store/orders/user',
        providesTags: ['Orders'],
    }),
    
    // 🌟 NEW: GET /api/store/orders/all (Landowner's Management View) 🌟
    getAllOrders: builder.query<Order[], void>({
        query: () => 'store/orders/all',
        providesTags: (result) => 
            result ? 
                [...result.map(({ _id }) => ({ type: 'Orders' as const, id: _id })), 'Orders'] : 
                ['Orders'],
    }),
  }),
});

// Export all generated hooks for use in components
export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  usePlaceOrderMutation,
  useGetUserOrdersQuery,
  useGetAllOrdersQuery, // 🌟 NEW EXPORT 🌟
} = storeApi;