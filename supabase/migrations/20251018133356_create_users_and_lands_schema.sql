/*
  # Create Users and Lands Management Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, either 'farmer' or 'landowner')
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `farmer_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `farm_size` (numeric, in acres)
      - `crop_types` (text array)
      - `experience_years` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lands`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `area` (numeric, in acres)
      - `price_per_acre` (numeric)
      - `soil_type` (text)
      - `water_availability` (text)
      - `status` (text, default 'available')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to read/update their own profiles
    - Add policies for farmers to view all available lands
    - Add policies for landowners to manage their own land listings
    - Add policies for authenticated users to create their profiles

  3. Important Notes
    - Profiles are linked to auth.users for authentication
    - Farmers can view all available lands posted by landowners
    - Landowners can post and manage multiple land listings
    - Role-based access control ensures proper data segregation
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('farmer', 'landowner')),
  full_name text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create farmer_profiles table
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farm_size numeric,
  crop_types text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can read own profile"
  ON farmer_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Farmers can insert own profile"
  ON farmer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Farmers can update own profile"
  ON farmer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create lands table
CREATE TABLE IF NOT EXISTS lands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text NOT NULL,
  area numeric NOT NULL,
  price_per_acre numeric,
  soil_type text,
  water_availability text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'rented', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view available lands"
  ON lands FOR SELECT
  TO authenticated
  USING (status = 'available' OR owner_id = auth.uid());

CREATE POLICY "Landowners can insert own lands"
  ON lands FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Landowners can update own lands"
  ON lands FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Landowners can delete own lands"
  ON lands FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lands_updated_at BEFORE UPDATE ON lands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();