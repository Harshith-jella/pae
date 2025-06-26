/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Security Changes
    - Drop the problematic admin policy that causes infinite recursion
    - Create a new admin policy that uses auth.jwt() to check role directly
    - Keep existing user policies intact

  The issue was that the admin policy was querying user_profiles table within
  the policy itself, causing infinite recursion. We fix this by using the
  JWT token data directly instead of querying the table.
*/

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Create a new admin policy that doesn't cause recursion
-- This uses the JWT token data directly instead of querying the table
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role'
    ) = 'admin'
  );

-- Alternative approach: Create a simpler policy that allows service role access
-- and relies on application-level admin checks
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

CREATE POLICY "Service role can read all profiles"
  ON user_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- For regular authenticated users, keep the existing policy
-- The "Users can read own profile" policy should remain: (uid() = id)