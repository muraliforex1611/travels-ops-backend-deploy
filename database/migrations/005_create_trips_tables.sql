-- =====================================================================
-- Create Trips Tables
-- =====================================================================

-- Step 1: Drop tables if exist (for clean install)
DROP TABLE IF EXISTS trip_locations CASCADE;
DROP TABLE IF EXISTS trips CASCADE;

-- Step 2: Drop functions if exist
DROP FUNCTION IF EXISTS update_trips_updated_at() CASCADE;

-- Step 3: Create the trips table
CREATE TABLE trips (
  trip_id SERIAL PRIMARY KEY,
  trip_code VARCHAR(20) UNIQUE NOT NULL,

  -- Relationships
  booking_id INTEGER REFERENCES bookings(booking_id),
  driver_id INTEGER REFERENCES drivers(driver_id),
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id),

  -- Trip Timeline
  start_time TIMESTAMP,
  end_time TIMESTAMP,

  -- Odometer Readings
  start_odometer DECIMAL(10, 2),
  end_odometer DECIMAL(10, 2),

  -- GPS Coordinates
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),
  end_lat DECIMAL(10, 8),
  end_lng DECIMAL(11, 8),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  last_location_update TIMESTAMP,

  -- Trip Metrics
  distance_traveled DECIMAL(10, 2),
  final_fare DECIMAL(10, 2),

  -- Status
  status VARCHAR(50) DEFAULT 'in_progress',

  -- Cancellation
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10, 2),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_trips_status CHECK (status IN ('in_progress', 'started', 'completed', 'cancelled'))
);

-- Step 4: Create the trip_locations table (GPS tracking history)
CREATE TABLE trip_locations (
  location_id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(trip_id) ON DELETE CASCADE,

  -- GPS Data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),

  -- Timestamp
  recorded_at TIMESTAMP DEFAULT NOW(),

  -- Index for quick lookup
  CONSTRAINT fk_trip_locations_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- Step 5: Create indexes for faster queries
CREATE INDEX idx_trips_booking_id ON trips(booking_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_trip_code ON trips(trip_code);
CREATE INDEX idx_trips_start_time ON trips(start_time);

CREATE INDEX idx_trip_locations_trip_id ON trip_locations(trip_id);
CREATE INDEX idx_trip_locations_recorded_at ON trip_locations(recorded_at);

-- Step 6: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger
CREATE TRIGGER trigger_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trips_updated_at();

-- =====================================================================
-- Verification Queries - Run these after to verify tables created
-- =====================================================================
-- SELECT * FROM trips LIMIT 1;
-- SELECT * FROM trip_locations LIMIT 1;

-- =====================================================================
-- SUCCESS! Tables created successfully! ✅
-- =====================================================================
