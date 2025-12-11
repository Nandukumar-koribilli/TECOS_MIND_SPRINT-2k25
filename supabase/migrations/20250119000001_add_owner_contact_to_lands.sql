-- Add owner contact information directly to lands table
-- This provides a fallback when profiles table access is restricted

-- Add owner contact columns to lands table
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_phone text;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS owner_email text;

-- Update existing lands with owner information from profiles
UPDATE lands 
SET 
  owner_name = profiles.full_name,
  owner_phone = profiles.phone,
  owner_email = profiles.email
FROM profiles 
WHERE lands.owner_id = profiles.id;

-- Make sure the email column exists in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update email from auth.users for existing profiles
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;
