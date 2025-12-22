-- =====================================================================
-- Create Customers Table
-- =====================================================================

-- Step 1: Drop table if exists (for clean install)
DROP TABLE IF EXISTS customers CASCADE;

-- Step 2: Drop function if exists
DROP FUNCTION IF EXISTS update_customers_updated_at() CASCADE;

-- Step 3: Create the customers table
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  customer_code VARCHAR(20) UNIQUE NOT NULL,

  -- Personal Details
  full_name VARCHAR(255) NOT NULL,
  mobile_primary VARCHAR(15) NOT NULL UNIQUE,
  mobile_alternate VARCHAR(15),
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Address Details
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(6),

  -- Company Details (for corporate customers)
  company_name VARCHAR(255),
  gst_number VARCHAR(50),

  -- Customer Type
  customer_type VARCHAR(50) DEFAULT 'individual',

  -- Personal Info
  date_of_birth DATE,

  -- Preferences
  preferences TEXT,

  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  total_cancelled INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 5.0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  blacklist_date TIMESTAMP,

  -- Additional Info
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER,

  -- Constraints
  CONSTRAINT chk_customers_type CHECK (customer_type IN ('individual', 'corporate'))
);

-- Step 4: Create indexes for faster queries
CREATE INDEX idx_customers_mobile_primary ON customers(mobile_primary);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE INDEX idx_customers_full_name ON customers(full_name);

-- Step 5: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- =====================================================================
-- Insert Sample Data (Optional - for testing)
-- =====================================================================
INSERT INTO customers (
  customer_code,
  full_name,
  mobile_primary,
  mobile_alternate,
  email,
  address,
  city,
  state,
  pincode,
  customer_type,
  date_of_birth
) VALUES
(
  'CUST0001',
  'Rajesh Kumar',
  '9876543210',
  '9876543211',
  'rajesh.kumar@example.com',
  '123 T Nagar Main Road',
  'Chennai',
  'Tamil Nadu',
  '600017',
  'individual',
  '1985-05-15'
),
(
  'CUST0002',
  'Priya Sharma',
  '9876543212',
  NULL,
  'priya.sharma@example.com',
  '456 Anna Nagar West',
  'Chennai',
  'Tamil Nadu',
  '600040',
  'individual',
  '1990-08-20'
),
(
  'CUST0003',
  'Tech Solutions Pvt Ltd',
  '9876543213',
  '9876543214',
  'contact@techsolutions.com',
  '789 OMR IT Park',
  'Chennai',
  'Tamil Nadu',
  '600096',
  'corporate',
  NULL
),
(
  'CUST0004',
  'Arun Prakash',
  '9876543215',
  NULL,
  'arun.prakash@example.com',
  '321 Velachery Road',
  'Chennai',
  'Tamil Nadu',
  '600042',
  'individual',
  '1988-12-10'
),
(
  'CUST0005',
  'Global Enterprises',
  '9876543216',
  '9876543217',
  'info@globalenterprises.com',
  '654 Guindy Industrial Estate',
  'Chennai',
  'Tamil Nadu',
  '600032',
  'corporate',
  NULL
);

-- =====================================================================
-- Verification Query - Run this after to verify table created
-- =====================================================================
-- SELECT * FROM customers LIMIT 5;

-- =====================================================================
-- SUCCESS! Table created successfully! ✅
-- =====================================================================
