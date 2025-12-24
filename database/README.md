# Database Setup Guide

## Quick Start

### Step 1: Run Migrations in Order

```bash
# Connect to your Supabase database or PostgreSQL
psql -h your-database-host -U postgres -d travel_ops

# Run migrations in order
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_additional_tables.sql
\i database/migrations/003_indexes_and_constraints.sql
\i database/migrations/004_automation_tables.sql
```

### Step 2: Load Seed Data

```bash
# Load sample data
\i database/seeds/001_initial_seed_data.sql
\i database/seeds/004_automation_seed_data.sql
```

## Using Supabase Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Open each migration file
3. Copy-paste content
4. Click **Run**

## Verify Installation

```sql
-- Check all tables are created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show:
-- allocation_logs
-- allocation_rules
-- booking_templates
-- bookings
-- companies
-- customers
-- driver_availability
-- drivers
-- email_bookings
-- email_integrations
-- trip_locations
-- trips
-- users
-- vehicle_availability
-- vehicle_categories
-- vehicles
-- whatsapp_bookings
-- whatsapp_integrations
```

## Check Sample Data

```sql
-- Check companies
SELECT company_name, company_code, credit_limit, auto_approve_bookings
FROM companies;

-- Check allocation rules
SELECT rule_name, rule_type, priority_order, is_active
FROM allocation_rules
ORDER BY priority_order DESC;

-- Check vehicle availability
SELECT v.registration_number, va.status, va.fuel_level_percentage, va.current_location_name
FROM vehicle_availability va
JOIN vehicles v ON va.vehicle_id = v.vehicle_id;

-- Check driver availability
SELECT d.full_name, da.status, da.is_on_duty, da.rating_average
FROM driver_availability da
JOIN drivers d ON da.driver_id = d.driver_id;
```

## Troubleshooting

### Error: Table already exists
- Drop the table first: `DROP TABLE table_name CASCADE;`
- Or skip that part of migration

### Error: Foreign key constraint
- Make sure parent tables exist first
- Run migrations in order

### Error: Permission denied
- Check database user has CREATE TABLE privileges
- Use superuser or owner role

## Database Backup

```bash
# Backup before running migrations
pg_dump -h your-host -U postgres travel_ops > backup_$(date +%Y%m%d).sql

# Restore if needed
psql -h your-host -U postgres travel_ops < backup_20251223.sql
```

## Next Steps

After database setup:
1. ✅ Database schemas created
2. ⏭️ Build NestJS modules for automation
3. ⏭️ Create auto-allocation service
4. ⏭️ Implement email parser
5. ⏭️ Implement WhatsApp integration
