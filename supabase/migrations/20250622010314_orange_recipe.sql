/*
  # PAE Platform - Payments and Transactions

  1. New Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `stripe_payment_method_id` (text)
      - `type` (enum: card, bank_account)
      - `card_brand` (text)
      - `card_last4` (text)
      - `card_exp_month` (integer)
      - `card_exp_year` (integer)
      - `is_default` (boolean)
      - `created_at` (timestamp)

    - `transactions`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `user_id` (uuid, references user_profiles)
      - `space_owner_id` (uuid, references user_profiles)
      - `stripe_payment_intent_id` (text)
      - `amount` (decimal)
      - `platform_fee` (decimal)
      - `owner_earnings` (decimal)
      - `currency` (text, default 'usd')
      - `status` (enum)
      - `payment_method_type` (text)
      - `failure_reason` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payouts`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references user_profiles)
      - `stripe_transfer_id` (text)
      - `amount` (decimal)
      - `currency` (text, default 'usd')
      - `status` (enum)
      - `period_start` (date)
      - `period_end` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for financial data access
*/

-- Create enums
CREATE TYPE payment_method_type AS ENUM ('card', 'bank_account');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'in_transit', 'paid', 'failed', 'cancelled');

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id text UNIQUE NOT NULL,
  type payment_method_type NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  space_owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  platform_fee decimal(10, 2) NOT NULL CHECK (platform_fee >= 0),
  owner_earnings decimal(10, 2) NOT NULL CHECK (owner_earnings >= 0),
  currency text DEFAULT 'usd',
  status transaction_status DEFAULT 'pending',
  payment_method_type text,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_transfer_id text UNIQUE,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'usd',
  status payout_status DEFAULT 'pending',
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR space_owner_id = auth.uid());

CREATE POLICY "System can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can view all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payouts policies
CREATE POLICY "Owners can view their own payouts"
  ON payouts
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "System can manage payouts"
  ON payouts
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(space_owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_payouts_owner_id ON payouts(owner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Set all other payment methods for this user to non-default
    UPDATE payment_methods 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default payment method
CREATE TRIGGER ensure_single_default_payment_method_trigger
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();