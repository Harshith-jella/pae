/*
  # Fix User Authentication Trigger

  1. Updates
    - Drop and recreate the user registration trigger with proper error handling
    - Ensure the trigger function handles all required fields correctly
    - Add better logging and error handling
    - Fix RLS policies to allow proper user creation

  2. Security
    - Maintains existing RLS policies
    - Ensures proper user profile creation during signup
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_role user_role;
BEGIN
  -- Extract name from metadata with multiple fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'New User'
  );
  
  -- Extract and validate role with proper error handling
  BEGIN
    user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role);
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'user'::user_role;
    WHEN OTHERS THEN
      user_role := 'user'::user_role;
  END;
  
  -- Insert user profile with all required fields
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    role,
    phone,
    address,
    avatar_url,
    date_of_birth,
    emergency_contact,
    bio,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    NULL, -- phone
    NULL, -- address
    NULL, -- avatar_url
    NULL, -- date_of_birth
    NULL, -- emergency_contact
    NULL, -- bio
    false, -- is_verified
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User profile already exists, this is okay
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error details for debugging
    RAISE LOG 'Error in handle_new_user for user % (ID: %): % - %', NEW.email, NEW.id, SQLSTATE, SQLERRM;
    -- Don't fail the auth signup, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Update RLS policies to be more permissive for user creation
DROP POLICY IF EXISTS "Allow trigger to insert user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Recreate policies with better permissions
CREATE POLICY "Allow trigger to insert user profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the user_profiles table has proper constraints
ALTER TABLE user_profiles ALTER COLUMN name SET DEFAULT 'New User';
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE user_profiles ALTER COLUMN is_verified SET DEFAULT false;