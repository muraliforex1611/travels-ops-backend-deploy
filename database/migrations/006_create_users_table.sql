-- =====================================================================
-- Create Users Table for Authentication
-- =====================================================================

-- Step 1: Drop table if exists (for clean install)
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Drop functions if exist
DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;

-- Step 3: Create the users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),

  -- Role-Based Access Control
  role VARCHAR(50) NOT NULL DEFAULT 'customer',

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,

  -- Additional Fields
  last_login_at TIMESTAMP,
  profile_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_users_role CHECK (role IN ('admin', 'driver', 'customer'))
);

-- Step 4: Create indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Step 5: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Step 7: Insert sample users (passwords are all 'password123' hashed)
-- Hash generated using bcrypt with salt rounds 10
-- You should change these passwords in production!
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, is_email_verified) VALUES
  -- Admin User
  ('admin@travelops.com', '$2b$10$agzHxK6ZmKMZhjvJN4lyBOEHQXxglqxxlEmdrQQfSQnJ.M.l.5LZW', 'Admin User', '9999999999', 'admin', true, true),

  -- Driver Users
  ('driver1@travelops.com', '$2b$10$agzHxK6ZmKMZhjvJN4lyBOEHQXxglqxxlEmdrQQfSQnJ.M.l.5LZW', 'Rajesh Kumar', '9876543210', 'driver', true, true),
  ('driver2@travelops.com', '$2b$10$agzHxK6ZmKMZhjvJN4lyBOEHQXxglqxxlEmdrQQfSQnJ.M.l.5LZW', 'Suresh Babu', '9876543211', 'driver', true, true),

  -- Customer Users
  ('customer1@example.com', '$2b$10$agzHxK6ZmKMZhjvJN4lyBOEHQXxglqxxlEmdrQQfSQnJ.M.l.5LZW', 'Ramesh Kumar', '9123456789', 'customer', true, true),
  ('customer2@example.com', '$2b$10$agzHxK6ZmKMZhjvJN4lyBOEHQXxglqxxlEmdrQQfSQnJ.M.l.5LZW', 'Priya Sharma', '9123456790', 'customer', true, true);

-- =====================================================================
-- Verification Queries - Run these after to verify table created
-- =====================================================================
-- SELECT * FROM users;
-- SELECT user_id, email, full_name, role FROM users WHERE role = 'admin';

-- =====================================================================
-- SUCCESS! Users table created successfully! ✅
-- =====================================================================
