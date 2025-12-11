// frontend/src/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../features/auth/authSlice';
import { LoginResponse, SignupResponse, AuthUser } from '../types';

const BASE_URL = 'http://localhost:8000/api/';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    // =========================================================
    // 1. LOGIN MUTATION
    // =========================================================
    login: builder.mutation<LoginResponse, Record<string, string>>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Handle state update after successful login
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const { token, role, user_id, full_name } = result.data;

          // Dispatch setCredentials to update Redux state and localStorage
          const user: AuthUser = { id: user_id, role, full_name };
          dispatch(setCredentials({ token, user }));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    // =========================================================
    // 2. SIGNUP MUTATION (Updated to auto-login)
    // =========================================================
    signup: builder.mutation<SignupResponse, Record<string, any>>({
      query: (userData) => ({
        url: 'auth/signup',
        method: 'POST',
        body: userData,
      }),
      // Handle state update after successful signup (auto-login)
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const { token, role, user_id, full_name } = result.data;

          // The signup response contains the token, so we set credentials immediately.
          const user: AuthUser = { id: user_id, role, full_name };
          dispatch(setCredentials({ token, user }));
        } catch (error) {
          console.error('Signup failed:', error);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;