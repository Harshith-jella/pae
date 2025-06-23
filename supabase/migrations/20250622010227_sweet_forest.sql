/*
  # PAE Platform - Parking Spaces

  1. New Tables
    - `parking_spaces`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references user_profiles)
      - `title` (text)
      - `description` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `price_per_hour` (decimal)
      - `size` (enum)
      - `type` (enum)
      - `amenities` (text array)
      - `images` (text array)
      - `is_active` (boolean)
      - `rating` (decimal, default 0)
      - `review_count` (integer, default 0)
      - `total_bookings` (integer, default 0)
      - `total_revenue` (decimal, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `space_availability`
      - `id` (uuid, primary key)
      - `space_id` (uuid, references parking_spaces)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for owners to manage their spaces
    - Add policies for users to view active spaces
*/

-- Create enums
CREATE TYPE space_size AS ENUM ('compact', 'standard', 'large', 'oversized');
CREATE TYPE space_type AS ENUM ('outdoor', 'covered', 'garage', 'street');

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

-- Create space availability table
CREATE TABLE IF NOT EXISTS space_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(space_id, date, start_time, end_time)
);

-- Enable RLS
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_availability ENABLE ROW LEVEL SECURITY;

-- Parking spaces policies
CREATE POLICY "Anyone can view active parking spaces"
  ON parking_spaces
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Owners can view their own spaces"
  ON parking_spaces
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their own spaces"
  ON parking_spaces
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own spaces"
  ON parking_spaces
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own spaces"
  ON parking_spaces
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all spaces"
  ON parking_spaces
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Space availability policies
CREATE POLICY "Anyone can view space availability"
  ON space_availability
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Space owners can manage availability"
  ON space_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parking_spaces
      WHERE id = space_availability.space_id AND owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_spaces_owner_id ON parking_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_city ON parking_spaces(city);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_active ON parking_spaces(is_active);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_location ON parking_spaces(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_space_availability_space_id ON space_availability(space_id);
CREATE INDEX IF NOT EXISTS idx_space_availability_date ON space_availability(date);

-- Create trigger for updated_at
CREATE TRIGGER update_parking_spaces_updated_at
  BEFORE UPDATE ON parking_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();