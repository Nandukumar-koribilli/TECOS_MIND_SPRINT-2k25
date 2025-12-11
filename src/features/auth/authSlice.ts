// frontend/src/features/auth/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthUser } from '../../types';

interface AuthCredentials {
    token: string;
    user: AuthUser;
}

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null') as AuthUser | null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthCredentials>) => {
      const { token, user } = action.payload;
      
      state.token = token;
      state.isAuthenticated = true;
      state.user = user;
      
      // Persist state to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;