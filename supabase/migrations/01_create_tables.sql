-- Create tables for Management Cotizații application
-- Run these SQL commands in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members Table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_type TEXT,
  id_series TEXT,
  id_number TEXT,
  company TEXT,
  join_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column
CREATE TRIGGER update_members_modtime
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payments_modtime
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- For now, allow all authenticated users to see all members and payments
-- In a production environment, you would want more restrictive policies
CREATE POLICY "Authenticated users can read all members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create admin user (optional)
-- Replace 'admin@example.com' and 'adminpassword' with your desired credentials
-- Note: This should be done through the Supabase Auth UI or API in a real application
-- This is just for demonstration purposes
/*
INSERT INTO auth.users (email, password, email_confirmed_at)
VALUES ('admin@example.com', 'adminpassword', NOW())
ON CONFLICT DO NOTHING;
*/