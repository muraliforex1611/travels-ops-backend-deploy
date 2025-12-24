-- =====================================================================
-- Migration 004: Automation & Integration Tables
-- Created: 2025-12-23
-- Purpose: Email/WhatsApp integration, Auto-allocation, Company management
-- =====================================================================

-- =====================================================================
-- 1. COMPANIES TABLE (Corporate Clients)
-- =====================================================================
CREATE TABLE IF NOT EXISTS companies (
  company_id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  email_domain VARCHAR(100), -- e.g., '@infosys.com' for auto-validation
  billing_address TEXT,
  gst_number VARCHAR(20),
  pan_number VARCHAR(10),
  contact_person VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),

  -- Financial settings
  credit_limit DECIMAL(12,2) DEFAULT 0,
  current_outstanding DECIMAL(12,2) DEFAULT 0,
  payment_terms VARCHAR(100) DEFAULT 'prepaid', -- 'prepaid', '15 days', '30 days', '45 days'

  -- Automation settings
  auto_approve_bookings BOOLEAN DEFAULT false,
  auto_allocate_vehicles BOOLEAN DEFAULT true,
  preferred_vehicle_category_id INTEGER REFERENCES vehicle_categories(category_id),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(user_id),

  CONSTRAINT unique_company_code UNIQUE(company_code),
  CONSTRAINT check_credit_limit CHECK (credit_limit >= 0),
  CONSTRAINT check_outstanding CHECK (current_outstanding >= 0)
);

-- Add index for fast company lookup
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_email_domain ON companies(email_domain);

-- =====================================================================
-- 2. EMAIL INTEGRATIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS email_integrations (
  integration_id SERIAL PRIMARY KEY,
  integration_name VARCHAR(100) NOT NULL,
  email_address VARCHAR(255) NOT NULL UNIQUE,

  -- IMAP/Email server settings
  email_provider VARCHAR(50) DEFAULT 'gmail', -- 'gmail', 'outlook', 'other'
  imap_host VARCHAR(100),
  imap_port INTEGER DEFAULT 993,
  imap_username VARCHAR(255),
  imap_password_encrypted TEXT, -- Store encrypted password
  use_ssl BOOLEAN DEFAULT true,

  -- Integration settings
  company_id INTEGER REFERENCES companies(company_id),
  is_active BOOLEAN DEFAULT true,
  auto_create_bookings BOOLEAN DEFAULT true,
  auto_send_confirmation BOOLEAN DEFAULT true,

  -- Polling settings
  poll_interval_minutes INTEGER DEFAULT 5,
  last_poll_time TIMESTAMP,
  last_email_processed_id VARCHAR(255),

  -- Statistics
  total_emails_processed INTEGER DEFAULT 0,
  total_bookings_created INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_poll_interval CHECK (poll_interval_minutes >= 1)
);

CREATE INDEX idx_email_integrations_active ON email_integrations(is_active);
CREATE INDEX idx_email_integrations_company ON email_integrations(company_id);

-- =====================================================================
-- 3. EMAIL BOOKINGS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS email_bookings (
  email_booking_id SERIAL PRIMARY KEY,
  integration_id INTEGER REFERENCES email_integrations(integration_id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,

  -- Email details
  email_message_id VARCHAR(255) UNIQUE NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject TEXT,
  body_text TEXT,
  body_html TEXT,

  -- Parsed booking data
  parsed_data JSONB, -- Stores extracted booking information

  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'received',
  -- Values: 'received', 'parsing', 'validated', 'booking_created', 'failed', 'ignored'
  processing_error TEXT,

  -- Validation
  validation_errors JSONB, -- Array of validation error messages
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00 - how confident the parser is

  -- Timestamps
  received_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_email_bookings_status ON email_bookings(processing_status);
CREATE INDEX idx_email_bookings_integration ON email_bookings(integration_id);
CREATE INDEX idx_email_bookings_received ON email_bookings(received_at DESC);

-- =====================================================================
-- 4. WHATSAPP INTEGRATIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  integration_id SERIAL PRIMARY KEY,
  integration_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,

  -- WhatsApp Business API settings
  provider VARCHAR(50) DEFAULT 'meta', -- 'meta', 'twilio', 'green_api', 'other'
  whatsapp_business_account_id VARCHAR(255),
  phone_number_id VARCHAR(255), -- Meta specific
  access_token_encrypted TEXT, -- Store encrypted token
  webhook_verify_token VARCHAR(255),
  webhook_url VARCHAR(500),

  -- Integration settings
  company_id INTEGER REFERENCES companies(company_id),
  is_active BOOLEAN DEFAULT true,
  auto_create_bookings BOOLEAN DEFAULT true,
  auto_send_confirmation BOOLEAN DEFAULT true,
  enable_interactive_chat BOOLEAN DEFAULT true,

  -- Statistics
  total_messages_received INTEGER DEFAULT 0,
  total_bookings_created INTEGER DEFAULT 0,
  total_messages_sent INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_whatsapp_phone UNIQUE(phone_number)
);

CREATE INDEX idx_whatsapp_integrations_active ON whatsapp_integrations(is_active);
CREATE INDEX idx_whatsapp_integrations_company ON whatsapp_integrations(company_id);

-- =====================================================================
-- 5. WHATSAPP BOOKINGS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS whatsapp_bookings (
  whatsapp_booking_id SERIAL PRIMARY KEY,
  integration_id INTEGER REFERENCES whatsapp_integrations(integration_id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,

  -- WhatsApp message details
  whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
  from_phone VARCHAR(20) NOT NULL,
  from_name VARCHAR(255),
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'document', 'location'

  -- Chat session
  session_id VARCHAR(100), -- Track conversation flow
  conversation_state VARCHAR(50), -- 'started', 'collecting_details', 'confirming', 'completed'

  -- Parsed booking data
  parsed_data JSONB, -- Stores extracted booking information

  -- Processing status
  processing_status VARCHAR(50) DEFAULT 'received',
  -- Values: 'received', 'parsing', 'validated', 'booking_created', 'failed', 'ignored'
  processing_error TEXT,

  -- Validation
  validation_errors JSONB,
  confidence_score DECIMAL(3,2),

  -- Timestamps
  received_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_wa_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_whatsapp_bookings_status ON whatsapp_bookings(processing_status);
CREATE INDEX idx_whatsapp_bookings_integration ON whatsapp_bookings(integration_id);
CREATE INDEX idx_whatsapp_bookings_session ON whatsapp_bookings(session_id);
CREATE INDEX idx_whatsapp_bookings_received ON whatsapp_bookings(received_at DESC);

-- =====================================================================
-- 6. VEHICLE AVAILABILITY TABLE (Real-time tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS vehicle_availability (
  availability_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(driver_id) ON DELETE SET NULL,

  -- Current status
  status VARCHAR(50) DEFAULT 'available',
  -- Values: 'available', 'assigned', 'on_trip', 'maintenance', 'offline', 'fuel_needed'

  -- Location tracking
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  current_location_name VARCHAR(255),
  location_updated_at TIMESTAMP,

  -- Vehicle status
  fuel_level_percentage INTEGER DEFAULT 100,
  odometer_reading INTEGER,
  last_service_km INTEGER,
  next_service_due_km INTEGER,

  -- Availability tracking
  last_trip_id INTEGER REFERENCES trips(trip_id),
  last_trip_end_time TIMESTAMP,
  next_available_time TIMESTAMP,

  -- Allocation tracking
  current_booking_id INTEGER REFERENCES bookings(booking_id),
  allocated_at TIMESTAMP,

  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_vehicle_availability UNIQUE(vehicle_id),
  CONSTRAINT check_fuel_level CHECK (fuel_level_percentage >= 0 AND fuel_level_percentage <= 100)
);

CREATE INDEX idx_vehicle_availability_status ON vehicle_availability(status);
CREATE INDEX idx_vehicle_availability_driver ON vehicle_availability(driver_id);
CREATE INDEX idx_vehicle_availability_location ON vehicle_availability(current_location_lat, current_location_lng);

-- =====================================================================
-- 7. DRIVER AVAILABILITY TABLE (Real-time tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS driver_availability (
  availability_id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(driver_id) ON DELETE CASCADE,

  -- Current status
  status VARCHAR(50) DEFAULT 'available',
  -- Values: 'available', 'assigned', 'on_trip', 'on_break', 'offline', 'on_leave'

  -- Shift information
  shift_start_time TIME,
  shift_end_time TIME,
  is_on_duty BOOLEAN DEFAULT false,
  duty_started_at TIMESTAMP,

  -- Performance tracking
  trips_completed_today INTEGER DEFAULT 0,
  total_distance_today_km DECIMAL(8,2) DEFAULT 0,
  total_earnings_today DECIMAL(10,2) DEFAULT 0,

  -- Availability tracking
  last_trip_id INTEGER REFERENCES trips(trip_id),
  last_trip_end_time TIMESTAMP,
  next_available_time TIMESTAMP,

  -- Current assignment
  current_booking_id INTEGER REFERENCES bookings(booking_id),
  current_vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
  allocated_at TIMESTAMP,

  -- Ratings
  rating_average DECIMAL(3,2) DEFAULT 5.00,
  total_ratings INTEGER DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_driver_availability UNIQUE(driver_id),
  CONSTRAINT check_rating CHECK (rating_average >= 0 AND rating_average <= 5)
);

CREATE INDEX idx_driver_availability_status ON driver_availability(status);
CREATE INDEX idx_driver_availability_duty ON driver_availability(is_on_duty);
CREATE INDEX idx_driver_availability_rating ON driver_availability(rating_average DESC);

-- =====================================================================
-- 8. ALLOCATION LOGS TABLE (Track all allocations)
-- =====================================================================
CREATE TABLE IF NOT EXISTS allocation_logs (
  allocation_log_id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES drivers(driver_id) ON DELETE SET NULL,

  -- Allocation details
  allocation_method VARCHAR(50) NOT NULL, -- 'auto', 'manual', 'email', 'whatsapp'
  allocation_source VARCHAR(100), -- 'system', 'admin', 'email_parser', 'whatsapp_bot'

  -- Scoring (for auto-allocation)
  allocation_score DECIMAL(5,2),
  distance_to_pickup_km DECIMAL(8,2),
  estimated_arrival_minutes INTEGER,

  -- Criteria used for allocation
  allocation_criteria JSONB, -- Stores all factors considered
  -- Example: {"availability_score": 10, "distance_score": 8, "rating_score": 9, "cost_score": 7}

  -- Reasons
  allocation_reason TEXT, -- Human-readable reason
  alternative_vehicles JSONB, -- Other vehicles that were considered

  -- Status tracking
  status VARCHAR(50) DEFAULT 'active',
  -- Values: 'active', 'cancelled', 'reassigned', 'completed'
  cancelled_reason TEXT,
  reassigned_to_allocation_id INTEGER REFERENCES allocation_logs(allocation_log_id),

  -- Timestamps
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  allocated_by INTEGER REFERENCES users(user_id),
  cancelled_at TIMESTAMP,

  CONSTRAINT check_allocation_score CHECK (allocation_score >= 0 AND allocation_score <= 100)
);

CREATE INDEX idx_allocation_logs_booking ON allocation_logs(booking_id);
CREATE INDEX idx_allocation_logs_vehicle ON allocation_logs(vehicle_id);
CREATE INDEX idx_allocation_logs_driver ON allocation_logs(driver_id);
CREATE INDEX idx_allocation_logs_status ON allocation_logs(status);
CREATE INDEX idx_allocation_logs_method ON allocation_logs(allocation_method);
CREATE INDEX idx_allocation_logs_allocated_at ON allocation_logs(allocated_at DESC);

-- =====================================================================
-- 9. ALLOCATION RULES TABLE (Configurable allocation rules)
-- =====================================================================
CREATE TABLE IF NOT EXISTS allocation_rules (
  rule_id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_description TEXT,

  -- Rule type
  rule_type VARCHAR(50) NOT NULL, -- 'vehicle_priority', 'driver_priority', 'distance_limit', 'cost_optimization'

  -- Conditions
  conditions JSONB, -- Complex rule conditions
  -- Example: {"vehicle_type": "own", "max_distance_km": 10, "min_fuel_percentage": 30}

  -- Weights for scoring
  weight_availability DECIMAL(3,2) DEFAULT 1.00,
  weight_distance DECIMAL(3,2) DEFAULT 1.00,
  weight_rating DECIMAL(3,2) DEFAULT 1.00,
  weight_cost DECIMAL(3,2) DEFAULT 1.00,
  weight_fuel DECIMAL(3,2) DEFAULT 1.00,

  -- Application
  applies_to_company_id INTEGER REFERENCES companies(company_id),
  applies_to_vehicle_category_id INTEGER REFERENCES vehicle_categories(category_id),
  priority_order INTEGER DEFAULT 0, -- Higher number = higher priority

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_allocation_rules_active ON allocation_rules(is_active);
CREATE INDEX idx_allocation_rules_type ON allocation_rules(rule_type);
CREATE INDEX idx_allocation_rules_priority ON allocation_rules(priority_order DESC);

-- =====================================================================
-- 10. BOOKING TEMPLATES TABLE (Email/WhatsApp templates)
-- =====================================================================
CREATE TABLE IF NOT EXISTS booking_templates (
  template_id SERIAL PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'email_parser', 'whatsapp_parser', 'confirmation_email', 'confirmation_whatsapp'

  -- For parsing templates
  expected_format TEXT, -- Expected format description
  regex_patterns JSONB, -- Array of regex patterns for parsing
  keyword_mappings JSONB, -- Map keywords to booking fields
  -- Example: {"from": ["pickup", "origin", "start"], "to": ["drop", "destination", "end"]}

  -- For confirmation templates
  template_content TEXT, -- Actual template with placeholders
  -- Example: "Your booking #{booking_code} is confirmed. Pickup: {pickup_location} at {pickup_time}"

  -- Application
  company_id INTEGER REFERENCES companies(company_id),
  language VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', 'ta', 'te'

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_booking_templates_type ON booking_templates(template_type);
CREATE INDEX idx_booking_templates_company ON booking_templates(company_id);
CREATE INDEX idx_booking_templates_active ON booking_templates(is_active);

-- =====================================================================
-- 11. Update existing BOOKINGS table to support automation
-- =====================================================================
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(company_id),
  ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'manual',
  -- Values: 'manual', 'email', 'whatsapp', 'api', 'mobile_app', 'web_portal'
  ADD COLUMN IF NOT EXISTS source_reference_id INTEGER,
  -- References email_booking_id or whatsapp_booking_id
  ADD COLUMN IF NOT EXISTS is_auto_allocated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_allocation_attempted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS auto_allocation_failed_reason TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(booking_source);
CREATE INDEX IF NOT EXISTS idx_bookings_auto_allocated ON bookings(is_auto_allocated);

-- =====================================================================
-- 12. Create trigger to update updated_at timestamp
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_integrations_updated_at BEFORE UPDATE ON email_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_integrations_updated_at BEFORE UPDATE ON whatsapp_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_availability_updated_at BEFORE UPDATE ON vehicle_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_availability_updated_at BEFORE UPDATE ON driver_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocation_rules_updated_at BEFORE UPDATE ON allocation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_templates_updated_at BEFORE UPDATE ON booking_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- 13. Insert default data
-- =====================================================================

-- Default allocation rule (prioritize own vehicles, closer distance, higher rating)
INSERT INTO allocation_rules (
  rule_name,
  rule_description,
  rule_type,
  weight_availability,
  weight_distance,
  weight_rating,
  weight_cost,
  priority_order,
  is_active
) VALUES (
  'Default Auto-Allocation',
  'Standard allocation rule prioritizing availability, distance, and driver rating',
  'vehicle_priority',
  1.50, -- Higher weight for availability
  1.20, -- Good weight for distance
  1.00, -- Standard weight for rating
  0.80, -- Lower weight for cost (quality over cost)
  100,
  true
);

-- =====================================================================
-- Migration complete
-- =====================================================================

-- Add comments to tables
COMMENT ON TABLE companies IS 'Corporate client companies for bulk bookings and credit management';
COMMENT ON TABLE email_integrations IS 'Email account integrations for automated booking creation';
COMMENT ON TABLE email_bookings IS 'Bookings created from email parsing';
COMMENT ON TABLE whatsapp_integrations IS 'WhatsApp Business API integrations for automated bookings';
COMMENT ON TABLE whatsapp_bookings IS 'Bookings created from WhatsApp messages';
COMMENT ON TABLE vehicle_availability IS 'Real-time vehicle availability and status tracking';
COMMENT ON TABLE driver_availability IS 'Real-time driver availability and performance tracking';
COMMENT ON TABLE allocation_logs IS 'Complete history of all vehicle-driver allocations';
COMMENT ON TABLE allocation_rules IS 'Configurable rules for auto-allocation algorithm';
COMMENT ON TABLE booking_templates IS 'Templates for parsing and confirming bookings';
