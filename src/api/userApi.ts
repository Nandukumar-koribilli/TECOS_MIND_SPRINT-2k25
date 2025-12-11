// frontend/src/api/userApi.ts (Needed for RTK Query Profile Management)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { UserProfile } from '../types';

const BASE_URL = 'http://localhost:8000/api/';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; 
    if (token) { headers.set('Authorization', `Bearer ${token}`); }
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // GET /api/profile/:user_id
    getProfile: builder.query<UserProfile, string>({
      query: (userId) => `profile/${userId}`,
      providesTags: (result, error, id) => [{ type: 'Profile', id }],
    }),
    // PUT /api/profile/:user_id
    updateProfile: builder.mutation<UserProfile, { userId: string, updates: Partial<UserProfile> }>({
      query: ({ userId, updates }) => ({
        url: `profile/${userId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId }],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = userApi;