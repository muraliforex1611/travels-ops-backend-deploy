-- =====================================================================
-- Create Bookings Table - FIXED VERSION
-- =====================================================================
-- Run this entire SQL in Supabase SQL Editor
-- =====================================================================

-- Step 1: Drop table if exists (for clean install)
DROP TABLE IF EXISTS bookings CASCADE;

-- Step 2: Drop function if exists
DROP FUNCTION IF EXISTS update_bookings_updated_at() CASCADE;

-- Step 3: Create the bookings table
CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL,

  -- Customer Details
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(15) NOT NULL,
  customer_email VARCHAR(255),

  -- Location Details
  pickup_location TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  drop_location TEXT NOT NULL,
  drop_lat DECIMAL(10, 8),
  drop_lng DECIMAL(11, 8),

  -- Booking Details
  pickup_datetime TIMESTAMP NOT NULL,
  vehicle_category_id INTEGER,
  passengers INTEGER NOT NULL DEFAULT 1,
  distance_km DECIMAL(10, 2),

  -- Fare Details
  estimated_fare DECIMAL(10, 2),
  actual_fare DECIMAL(10, 2),

  -- Assignment
  driver_id INTEGER,
  vehicle_id INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',

  -- Additional Info
  special_requirements TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_bookings_status CHECK (status IN ('pending', 'confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT chk_bookings_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT fk_bookings_vehicle_category FOREIGN KEY (vehicle_category_id) REFERENCES vehicle_categories(category_id),
  CONSTRAINT fk_bookings_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- Step 4: Create indexes for faster queries
CREATE INDEX idx_bookings_customer_mobile ON bookings(customer_mobile);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);

-- Step 5: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- =====================================================================
-- Verification Query - Run this after to verify table created
-- =====================================================================
-- SELECT * FROM bookings LIMIT 1;

-- =====================================================================
-- SUCCESS! Table created successfully! ✅
-- =====================================================================
