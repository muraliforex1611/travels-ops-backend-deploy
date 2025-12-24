-- =====================================================================
-- Seed Data for Automation Tables
-- Created: 2025-12-23
-- Purpose: Sample data for testing automation features
-- =====================================================================

-- =====================================================================
-- 1. Sample Companies
-- =====================================================================
INSERT INTO companies (
  company_name, company_code, email_domain, billing_address,
  gst_number, pan_number, contact_person, contact_email, contact_phone,
  credit_limit, payment_terms, auto_approve_bookings, auto_allocate_vehicles, is_active
) VALUES
  (
    'Infosys Technologies Ltd',
    'INFY001',
    '@infosys.com',
    'Electronics City, Phase 1, Bangalore, Karnataka - 560100',
    '29AABCI1234F1Z5',
    'AABCI1234F',
    'Ramesh Kumar',
    'transport.admin@infosys.com',
    '+91 80 2852 0261',
    500000.00,
    '30 days',
    true,
    true,
    true
  ),
  (
    'TCS - Tata Consultancy Services',
    'TCS001',
    '@tcs.com',
    'Siruseri IT Park, Chennai, Tamil Nadu - 600130',
    '33AAACT2727Q1ZW',
    'AAACT2727Q',
    'Priya Sharma',
    'admin.transport@tcs.com',
    '+91 44 6741 4000',
    750000.00,
    '45 days',
    true,
    true,
    true
  ),
  (
    'Wipro Limited',
    'WIP001',
    '@wipro.com',
    'Doddakannelli, Sarjapur Road, Bangalore, Karnataka - 560035',
    '29AABCW3775E1ZQ',
    'AABCW3775E',
    'Suresh Reddy',
    'facilities@wipro.com',
    '+91 80 2844 0011',
    400000.00,
    '30 days',
    false,
    true,
    true
  );

-- =====================================================================
-- 2. Sample Booking Templates (Email Parsing)
-- =====================================================================
INSERT INTO booking_templates (
  template_name, template_type, expected_format, regex_patterns, keyword_mappings,
  company_id, is_active, is_default
) VALUES
  (
    'Standard Email Booking Format',
    'email_parser',
    'Expected format: Pickup Location, Drop Location, Date & Time, Passengers, Contact details',
    '{
      "pickup": "(?i)(pickup|from|origin|start)\\s*[:=]?\\s*([^\\n]+)",
      "drop": "(?i)(drop|to|destination|end)\\s*[:=]?\\s*([^\\n]+)",
      "datetime": "(?i)(date|time|datetime|when)\\s*[:=]?\\s*([^\\n]+)",
      "passengers": "(?i)(passengers?|pax|people|persons?)\\s*[:=]?\\s*(\\d+)",
      "contact": "(?i)(contact|phone|mobile|cell)\\s*[:=]?\\s*([+\\d\\s-]+)",
      "name": "(?i)(name|passenger name|customer)\\s*[:=]?\\s*([^\\n]+)"
    }'::jsonb,
    '{
      "pickup": ["pickup", "from", "origin", "start", "source"],
      "drop": ["drop", "to", "destination", "end", "dest"],
      "datetime": ["date", "time", "datetime", "when", "schedule"],
      "passengers": ["passengers", "pax", "people", "persons", "seats"],
      "contact": ["contact", "phone", "mobile", "cell", "number"],
      "name": ["name", "passenger", "customer", "client"]
    }'::jsonb,
    NULL,
    true,
    true
  ),
  (
    'Infosys Booking Template',
    'email_parser',
    'Infosys specific email format',
    '{
      "employee_id": "(?i)(emp id|employee id|emp\\s*#)\\s*[:=]?\\s*([A-Z0-9]+)",
      "project_code": "(?i)(project|project code)\\s*[:=]?\\s*([A-Z0-9-]+)"
    }'::jsonb,
    '{
      "pickup": ["pickup location", "from", "source"],
      "drop": ["drop location", "to", "destination"],
      "trip_type": ["trip type", "journey type"]
    }'::jsonb,
    (SELECT company_id FROM companies WHERE company_code = 'INFY001'),
    true,
    false
  );

-- =====================================================================
-- 3. Sample Booking Templates (Confirmation Messages)
-- =====================================================================
INSERT INTO booking_templates (
  template_name, template_type, template_content, language, is_active, is_default
) VALUES
  (
    'Email Booking Confirmation - English',
    'confirmation_email',
    'Dear {customer_name},

Your booking has been confirmed!

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Code: {booking_code}
Pickup: {pickup_location}
Drop: {drop_location}
Date & Time: {pickup_datetime}
Passengers: {passengers}

Vehicle Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vehicle: {vehicle_make} {vehicle_model}
Registration: {vehicle_registration}
Vehicle Type: {vehicle_category}

Driver Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Driver Name: {driver_name}
Contact: {driver_mobile}
Rating: {driver_rating} ⭐

Estimated Fare: ₹{estimated_fare}

Track your ride: {tracking_link}

For any changes or cancellations, please contact us at:
📞 Phone: +91 9876543210
📧 Email: support@travelops.com

Thank you for choosing our services!

Best regards,
Travel Operations Team',
    'en',
    true,
    true
  ),
  (
    'WhatsApp Booking Confirmation',
    'confirmation_whatsapp',
    '✅ *Booking Confirmed!*

📋 *Booking Code:* {booking_code}

🚗 *Trip Details:*
📍 Pickup: {pickup_location}
📍 Drop: {drop_location}
🕐 Time: {pickup_datetime}
👥 Passengers: {passengers}

🚙 *Vehicle:* {vehicle_make} {vehicle_model}
🔖 *Reg No:* {vehicle_registration}

👤 *Driver:* {driver_name}
📱 *Contact:* {driver_mobile}
⭐ *Rating:* {driver_rating}

💰 *Estimated Fare:* ₹{estimated_fare}

Track: {tracking_link}

_Need help? Reply to this message_',
    'en',
    true,
    true
  );

-- =====================================================================
-- 4. Sample Allocation Rules
-- =====================================================================
INSERT INTO allocation_rules (
  rule_name, rule_description, rule_type, conditions,
  weight_availability, weight_distance, weight_rating, weight_cost, weight_fuel,
  priority_order, is_active
) VALUES
  (
    'Premium Service Rule',
    'For high-value clients - prioritize best drivers and vehicles',
    'driver_priority',
    '{"min_driver_rating": 4.5, "vehicle_condition": "excellent"}'::jsonb,
    1.50,
    1.00,
    2.00, -- High weight on driver rating
    0.50, -- Low weight on cost
    1.20,
    200,
    true
  ),
  (
    'Cost Optimization Rule',
    'Minimize costs by preferring own vehicles and minimizing distance',
    'cost_optimization',
    '{"prefer_vehicle_type": "own", "max_distance_km": 15}'::jsonb,
    1.20,
    1.50, -- High weight on distance
    0.80,
    2.00, -- Very high weight on cost
    1.00,
    150,
    true
  ),
  (
    'Emergency Booking Rule',
    'For urgent bookings - prioritize availability and proximity',
    'vehicle_priority',
    '{"booking_type": "emergency", "max_response_time_minutes": 15}'::jsonb,
    2.00, -- Maximum weight on availability
    1.80, -- Very high weight on distance
    0.50,
    0.30,
    0.80,
    300,
    true
  ),
  (
    'Corporate Client Rule - Infosys',
    'Allocation rule for Infosys bookings',
    'vehicle_priority',
    '{"company_id": 1, "preferred_vehicle_categories": [1, 2]}'::jsonb,
    1.30,
    1.20,
    1.50,
    1.00,
    1.10,
    180,
    true
  );

-- =====================================================================
-- 5. Initialize Vehicle Availability (for existing vehicles)
-- =====================================================================
-- This will create availability records for all existing vehicles
INSERT INTO vehicle_availability (
  vehicle_id, driver_id, status,
  current_location_name, fuel_level_percentage,
  odometer_reading, next_available_time
)
SELECT
  v.vehicle_id,
  v.primary_driver_id,
  CASE
    WHEN v.current_status = 'active' THEN 'available'
    WHEN v.current_status = 'maintenance' THEN 'maintenance'
    ELSE 'offline'
  END,
  'Head Office - Parking Area',
  FLOOR(RANDOM() * 40 + 60)::INTEGER, -- Random fuel between 60-100%
  v.current_odometer,
  CURRENT_TIMESTAMP
FROM vehicles v
ON CONFLICT (vehicle_id) DO NOTHING;

-- =====================================================================
-- 6. Initialize Driver Availability (for existing drivers)
-- =====================================================================
INSERT INTO driver_availability (
  driver_id, status, shift_start_time, shift_end_time,
  is_on_duty, rating_average, total_ratings
)
SELECT
  d.driver_id,
  CASE
    WHEN d.current_status = 'active' THEN 'available'
    WHEN d.current_status = 'on_trip' THEN 'on_trip'
    ELSE 'offline'
  END,
  '08:00:00',
  '20:00:00',
  (d.current_status = 'active' OR d.current_status = 'on_trip'),
  ROUND((RANDOM() * 1.5 + 3.5)::numeric, 2), -- Random rating between 3.5-5.0
  FLOOR(RANDOM() * 100 + 20)::INTEGER -- Random 20-120 ratings
FROM drivers d
ON CONFLICT (driver_id) DO NOTHING;

-- =====================================================================
-- Comments for reference
-- =====================================================================
COMMENT ON TABLE companies IS 'Sample companies added: Infosys, TCS, Wipro for testing corporate booking automation';
COMMENT ON TABLE booking_templates IS 'Templates for parsing emails/WhatsApp and sending confirmations in English';
COMMENT ON TABLE allocation_rules IS 'Multiple allocation strategies: Premium, Cost-optimized, Emergency, Corporate-specific';
