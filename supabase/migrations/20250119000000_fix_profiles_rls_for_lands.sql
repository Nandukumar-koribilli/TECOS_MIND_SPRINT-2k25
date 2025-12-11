-- Fix RLS policy for profiles to allow reading landowner profiles when viewing lands
-- This allows farmers to see landowner contact information when viewing available lands

-- Add email column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update email from auth.users for existing profiles
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;

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
