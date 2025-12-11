// frontend/src/hooks/useAppHooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';

// Use this throughout your app instead of plain `useDispatch`
export const useAppDispatch: () => AppDispatch = useDispatch;
// Use this throughout your app instead of plain `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;