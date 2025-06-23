/*
  # Fix user registration trigger

  1. Database Functions
    - Create or replace the handle_new_user trigger function
    - Ensure it properly extracts user data from auth metadata
    - Handle cases where name might be missing from metadata

  2. Triggers
    - Ensure trigger is properly configured on auth.users table
    - Set up proper trigger timing and events

  3. Security
    - Ensure RLS policies allow the trigger to insert user profiles
*/

-- Create or replace the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'user'::user_role,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;

-- Add a policy to allow the trigger to insert user profiles
DO $$
BEGIN
  -- Check if the policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Allow trigger to insert user profiles'
  ) THEN
    CREATE POLICY "Allow trigger to insert user profiles"
      ON user_profiles
      FOR INSERT
      TO authenticated, anon
      WITH CHECK (true);
  END IF;
END $$;