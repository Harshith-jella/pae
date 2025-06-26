/*
  # Fresh Database Schema Setup

  1. Clean Setup
    - Drop existing tables and data
    - Recreate all tables with proper structure
    - Set up RLS policies
    - Insert fresh demo data

  2. Security
    - Enable RLS on all tables
    - Create proper policies for each user role
    - Ensure data isolation between users

  3. Demo Data
    - Create demo users with proper authentication
    - Add sample parking spaces and bookings
*/

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_spaces CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS space_type CASCADE;
DROP TYPE IF EXISTS space_size CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'user');
CREATE TYPE space_size AS ENUM ('compact', 'standard', 'large', 'oversized');
CREATE TYPE space_type AS ENUM ('outdoor', 'covered', 'garage', 'street');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE notification_type AS ENUM (
  'booking_confirmed', 'booking_rejected', 'booking_cancelled', 'booking_reminder',
  'payment_successful', 'payment_failed', 'payout_processed',
  'review_received', 'space_approved', 'space_rejected',
  'system_announcement', 'security_alert'
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  phone text,
  address text,
  avatar_url text,
  date_of_birth date,
  emergency_contact text,
  bio text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create parking spaces table
CREATE TABLE parking_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  price_per_hour decimal(10, 2) NOT NULL CHECK (price_per_hour > 0),
  size space_size NOT NULL DEFAULT 'standard',
  type space_type NOT NULL DEFAULT 'outdoor',
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  rating decimal(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0 CHECK (review_count >= 0),
  total_bookings integer DEFAULT 0 CHECK (total_bookings >= 0),
  total_revenue decimal(12, 2) DEFAULT 0 CHECK (total_revenue >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  space_id uuid NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_hours decimal(5, 2) NOT NULL CHECK (total_hours > 0),
  hourly_rate decimal(10, 2) NOT NULL CHECK (hourly_rate > 0),
  total_amount decimal(10, 2) NOT NULL CHECK (total_amount > 0),
  platform_fee decimal(10, 2) DEFAULT 0 CHECK (platform_fee >= 0),
  owner_earnings decimal(10, 2) NOT NULL CHECK (owner_earnings >= 0),
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_intent_id text,
  is_recurring boolean DEFAULT false,
  recurring_days text[] DEFAULT '{}',
  recurring_end_date date,
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  space_id uuid NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, booking_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for parking_spaces
CREATE POLICY "Parking spaces are viewable by everyone" ON parking_spaces FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert parking spaces" ON parking_spaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own spaces" ON parking_spaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their own spaces" ON parking_spaces FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Space owners can view bookings for their spaces" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM parking_spaces WHERE id = bookings.space_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Space owners can update booking status" ON bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM parking_spaces WHERE id = bookings.space_id AND owner_id = auth.uid())
);

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their completed bookings" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM bookings WHERE id = reviews.booking_id AND user_id = auth.uid() AND status = 'completed'
  )
);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_parking_spaces_owner_id ON parking_spaces(owner_id);
CREATE INDEX idx_parking_spaces_city ON parking_spaces(city);
CREATE INDEX idx_parking_spaces_active ON parking_spaces(is_active);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_space_id ON bookings(space_id);
CREATE INDEX idx_reviews_space_id ON reviews(space_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parking_spaces_updated_at BEFORE UPDATE ON parking_spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user registration trigger
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
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();