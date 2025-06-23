/*
  # PAE Platform - Bookings System

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `space_id` (uuid, references parking_spaces)
      - `start_date` (date)
      - `end_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `total_hours` (decimal)
      - `hourly_rate` (decimal)
      - `total_amount` (decimal)
      - `platform_fee` (decimal)
      - `owner_earnings` (decimal)
      - `status` (enum)
      - `payment_status` (enum)
      - `payment_intent_id` (text, for Stripe)
      - `is_recurring` (boolean)
      - `recurring_days` (text array)
      - `recurring_end_date` (date)
      - `special_instructions` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on bookings table
    - Add policies for users to manage their bookings
    - Add policies for space owners to view bookings for their spaces
*/

-- Create enums
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

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
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_recurring_end CHECK (
    (is_recurring = false) OR 
    (is_recurring = true AND recurring_end_date IS NOT NULL AND recurring_end_date >= end_date)
  )
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Booking policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Space owners can view bookings for their spaces"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parking_spaces
      WHERE id = bookings.space_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Space owners can update booking status"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parking_spaces
      WHERE id = bookings.space_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space_id ON bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate platform fee and owner earnings
CREATE OR REPLACE FUNCTION calculate_booking_amounts()
RETURNS trigger AS $$
BEGIN
  -- Calculate platform fee (10% of total amount)
  NEW.platform_fee = NEW.total_amount * 0.10;
  
  -- Calculate owner earnings (90% of total amount)
  NEW.owner_earnings = NEW.total_amount - NEW.platform_fee;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate amounts
CREATE TRIGGER calculate_booking_amounts_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION calculate_booking_amounts();