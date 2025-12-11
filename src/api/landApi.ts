// frontend/src/api/landApi.ts (FINALIZED - COMPLETE CRUD SYNC)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { Land, NewLandData } from '../types';

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

export const landApi = createApi({
  reducerPath: 'landApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Lands', 'UserLands'],
  endpoints: (builder) => ({
    
    // GET /api/lands (Read All)
    getLands: builder.query<Land[], void>({
      query: () => 'lands',
      providesTags: ['Lands'],
    }),

    // GET /api/lands/user/:userId (Read User Specific)
    getUserLands: builder.query<Land[], string>({
      query: (userId) => `lands/user/${userId}`,
      providesTags: (result, error, id) => [{ type: 'UserLands' as const, id }],
    }),

    // POST /api/lands (Create)
    createLand: builder.mutation<Land, NewLandData>({
      query: (newLandData) => ({
        url: 'lands',
        method: 'POST',
        body: newLandData,
      }),
      invalidatesTags: ['Lands', 'UserLands'], 
    }),

    // 🌟 SYNCHRONIZED FIX: Add Update Land Mutation (PUT) 🌟
    // PUT /api/lands/:landId
    updateLand: builder.mutation<Land, { landId: string, updates: Partial<NewLandData> }>({
      query: ({ landId, updates }) => ({
        url: `lands/${landId}`,
        method: 'PUT',
        body: updates,
      }),
      // Invalidate tags to update user's listings and global lands list
      invalidatesTags: (result, error, { landId }) => [
        { type: 'Lands', id: landId },
        'UserLands'
      ],
    }),

    // DELETE /api/lands/:landId (Delete)
    deleteLand: builder.mutation<void, string>({
      query: (landId) => ({
        url: `lands/${landId}`,
        method: 'DELETE',
      }),
      // Invalidate tags to force RTK Query to refetch the user's land list
      invalidatesTags: ['Lands', 'UserLands'],
    }),
  }),
});

// 🌟 FINAL EXPORTS: Includes the new useUpdateLandMutation hook 🌟
export const { 
    useGetLandsQuery, 
    useGetUserLandsQuery, 
    useCreateLandMutation, 
    useUpdateLandMutation, // <--- NEWLY ADDED EXPORT
    useDeleteLandMutation 
} = landApi;