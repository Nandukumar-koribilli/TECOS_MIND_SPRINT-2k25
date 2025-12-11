import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'farmer' | 'landowner';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farm_size?: number;
  crop_types?: string[];
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface Land {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  location: string;
  area: number;
  price_per_acre?: number;
  soil_type?: string;
  water_availability?: string;
  status: 'available' | 'rented' | 'sold';
  created_at: string;
  updated_at: string;
}
