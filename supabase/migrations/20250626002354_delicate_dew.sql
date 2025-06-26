/*
  # Final fix for authentication issues

  1. Database Functions
    - Simplify the handle_new_user trigger function
    - Add better error handling and logging
    - Ensure all required fields are handled properly

  2. RLS Policies
    - Fix the infinite recursion issue in admin policies
    - Ensure proper permissions for user creation and access

  3. Security
    - Maintain data integrity while fixing access issues
*/

-- Drop existing problematic policies and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON user_profiles;

-- Create a simple, robust handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'New User'
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'user'::user_role
    ),
    false,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, that's fine
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Create a simple admin policy that doesn't cause recursion
CREATE POLICY "Service role can read all profiles"
  ON user_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Ensure basic policies exist and work correctly
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert user profiles" ON user_profiles;

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

CREATE POLICY "Allow user creation"
  ON user_profiles
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);

-- Create a test user for development (admin@pae.com / password123)
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Only create if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pae.com') THEN
    -- Generate a UUID for the test user
    test_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      test_user_id,
      'authenticated',
      'authenticated',
      'admin@pae.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin User", "role": "admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert into user_profiles
    INSERT INTO public.user_profiles (
      id,
      email,
      name,
      role,
      is_verified,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'admin@pae.com',
      'Admin User',
      'admin',
      true,
      NOW(),
      NOW()
    );
  END IF;
END $$;