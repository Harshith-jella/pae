/*
  # PAE Platform - Complete Database Schema
  
  This migration creates the complete database schema for the PAE parking platform.
  Run this in your Supabase SQL Editor to set up all tables, policies, and functions.
*/

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
CREATE TABLE IF NOT EXISTS user_profiles (
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
CREATE TABLE IF NOT EXISTS parking_spaces (
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
CREATE TABLE IF NOT EXISTS bookings (
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
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS notifications (
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

-- User profiles policies
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow user creation" ON user_profiles FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Parking spaces policies
CREATE POLICY "Anyone can view active parking spaces" ON parking_spaces FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Owners can view their own spaces" ON parking_spaces FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can insert their own spaces" ON parking_spaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their own spaces" ON parking_spaces FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Space owners can view bookings for their spaces" ON bookings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM parking_spaces WHERE id = bookings.space_id AND owner_id = auth.uid())
);
CREATE POLICY "Space owners can update booking status" ON bookings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM parking_spaces WHERE id = bookings.space_id AND owner_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reviews for their completed bookings" ON reviews FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM bookings WHERE id = reviews.booking_id AND user_id = auth.uid() AND status = 'completed'
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_spaces_owner_id ON parking_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_city ON parking_spaces(city);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_active ON parking_spaces(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space_id ON bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_reviews_space_id ON reviews(space_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

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

-- Insert demo users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'admin@pae.com',
  crypt('password123', gen_salt('bf')), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "role": "admin"}',
  NOW(), NOW()
),
(
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'owner@pae.com',
  crypt('password123', gen_salt('bf')), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Space Owner", "role": "owner"}',
  NOW(), NOW()
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated', 'user@pae.com',
  crypt('password123', gen_salt('bf')), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Regular User", "role": "user"}',
  NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo user profiles
INSERT INTO user_profiles (id, email, name, role, is_verified, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@pae.com', 'Admin User', 'admin', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'owner@pae.com', 'Space Owner', 'owner', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'user@pae.com', 'Regular User', 'user', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo parking spaces
INSERT INTO parking_spaces (
  id, owner_id, title, description, address, city, state, zip_code,
  latitude, longitude, price_per_hour, size, type, amenities, images,
  is_active, rating, review_count
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'Downtown Garage - Secure Parking',
  'Premium covered parking space in the heart of downtown. 24/7 security, EV charging available.',
  '123 Main Street', 'San Francisco', 'CA', '94105',
  37.7749, -122.4194, 8.00, 'standard', 'garage',
  ARRAY['24/7 Security', 'EV Charging', 'Covered', 'CCTV', 'Accessible'],
  ARRAY['https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800'],
  true, 4.8, 124
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Airport Long-term Parking',
  'Convenient parking near the airport with shuttle service. Perfect for travelers.',
  '456 Airport Blvd', 'San Francisco', 'CA', '94128',
  37.6213, -122.3790, 5.00, 'standard', 'outdoor',
  ARRAY['Shuttle Service', 'Outdoor', 'Long-term', 'Security Patrol'],
  ARRAY['https://images.pexels.com/photos/63294/autos-cars-motor-vehicles-packed-63294.jpeg?auto=compress&cs=tinysrgb&w=800'],
  true, 4.5, 89
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'Shopping Center Covered Spot',
  'Covered parking spot in busy shopping center. Walking distance to restaurants and shops.',
  '789 Shopping Way', 'Palo Alto', 'CA', '94301',
  37.4419, -122.1430, 6.00, 'large', 'covered',
  ARRAY['Covered', 'Shopping Access', 'Well Lit', 'Wide Space'],
  ARRAY['https://images.pexels.com/photos/376729/pexels-photo-376729.jpeg?auto=compress&cs=tinysrgb&w=800'],
  true, 4.3, 67
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo bookings
INSERT INTO bookings (
  id, user_id, space_id, start_date, end_date, start_time, end_time,
  total_hours, hourly_rate, total_amount, platform_fee, owner_earnings,
  status, payment_status
) VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '33333333-3333-3333-3333-333333333333',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2024-12-20', '2024-12-20', '09:00', '17:00',
  8.0, 8.00, 64.00, 6.40, 57.60,
  'confirmed', 'paid'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '33333333-3333-3333-3333-333333333333',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2024-12-22', '2024-12-26', '00:00', '23:59',
  96.0, 5.00, 480.00, 48.00, 432.00,
  'pending', 'pending'
)
ON CONFLICT (id) DO NOTHING;