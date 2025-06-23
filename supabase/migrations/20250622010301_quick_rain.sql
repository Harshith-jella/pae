/*
  # PAE Platform - Reviews and Ratings System

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `space_id` (uuid, references parking_spaces)
      - `booking_id` (uuid, references bookings)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `is_anonymous` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on reviews table
    - Add policies for users to create/manage their reviews
    - Add policies for viewing reviews
*/

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

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Review policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their completed bookings"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id 
      AND user_id = auth.uid() 
      AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_space_id ON reviews(space_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update parking space rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_space_rating()
RETURNS trigger AS $$
DECLARE
  space_uuid uuid;
  avg_rating decimal(3,2);
  review_count integer;
BEGIN
  -- Get space_id from the review
  IF TG_OP = 'DELETE' THEN
    space_uuid = OLD.space_id;
  ELSE
    space_uuid = NEW.space_id;
  END IF;

  -- Calculate new average rating and count
  SELECT 
    COALESCE(AVG(rating), 0)::decimal(3,2),
    COUNT(*)::integer
  INTO avg_rating, review_count
  FROM reviews 
  WHERE space_id = space_uuid;

  -- Update parking space
  UPDATE parking_spaces 
  SET 
    rating = avg_rating,
    review_count = review_count,
    updated_at = now()
  WHERE id = space_uuid;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update space rating
CREATE TRIGGER update_space_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_space_rating();

CREATE TRIGGER update_space_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_space_rating();

CREATE TRIGGER update_space_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_space_rating();