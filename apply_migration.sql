-- Apply this SQL in your Supabase Dashboard > SQL Editor
-- This will fix the profiles table and RLS policies

-- Add owner contact columns to lands table
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_phone text;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_email text;

-- Add email column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update email from auth.users for existing profiles
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Update existing lands with owner information from profiles
UPDATE lands 
SET 
  owner_name = profiles.full_name,
  owner_phone = profiles.phone,
  owner_email = profiles.email
FROM profiles 
WHERE lands.owner_id = profiles.id;

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create a new policy that allows users to read their own profile
-- and also allows reading profiles of landowners whose lands are available
CREATE POLICY "Users can read own profile and landowner profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    id IN (
      SELECT owner_id 
      FROM lands 
      WHERE status = 'available'
    )
  );

-- Also allow reading profiles for any authenticated user (temporary fix)
CREATE POLICY "Allow reading all profiles for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);
