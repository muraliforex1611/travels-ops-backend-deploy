# 🎯 Customers Module Setup Guide

## ✅ Files Created

### 1. DTOs
- ✅ `src/modules/customers/dto/create-customer.dto.ts`
- ✅ `src/modules/customers/dto/update-customer.dto.ts`

### 2. Service
- ✅ `src/modules/customers/customers.service.ts`

### 3. Controller
- ✅ `src/modules/customers/customers.controller.ts`

### 4. Module
- ✅ `src/modules/customers/customers.module.ts`

### 5. Database
- ✅ `database/migrations/004_create_customers_table.sql`

### 6. App Registration
- ✅ Updated `src/app.module.ts`
- ✅ Updated `src/main.ts` (Swagger)

---

## 📊 API Endpoints (7)

### 1. GET /api/v1/customers
Get all customers with optional filters
```bash
curl http://localhost:3000/api/v1/customers
curl "http://localhost:3000/api/v1/customers?customerType=individual"
curl "http://localhost:3000/api/v1/customers?isActive=true"
curl "http://localhost:3000/api/v1/customers?search=rajesh"
```

### 2. GET /api/v1/customers/search?q=term
Search customers
```bash
curl "http://localhost:3000/api/v1/customers/search?q=rajesh"
curl "http://localhost:3000/api/v1/customers/search?q=9876"
```

### 3. GET /api/v1/customers/:id
Get customer by ID
```bash
curl http://localhost:3000/api/v1/customers/1
```

### 4. GET /api/v1/customers/:id/bookings
Get customer booking history
```bash
curl http://localhost:3000/api/v1/customers/1/bookings
```

### 5. POST /api/v1/customers
Create new customer
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Karthik Raghavan",
    "mobile_primary": "9123456789",
    "email": "karthik@example.com",
    "address": "123 Anna Nagar",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600040",
    "customer_type": "individual"
  }'
```

### 6. PUT /api/v1/customers/:id
Update customer
```bash
curl -X PUT http://localhost:3000/api/v1/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.updated@example.com",
    "preferences": "AC preferred, non-smoking"
  }'
```

### 7. DELETE /api/v1/customers/:id
Deactivate customer (soft delete)
```bash
curl -X DELETE http://localhost:3000/api/v1/customers/1
```

---

## 🗄️ Database Setup

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Migration
1. Copy the contents of `database/migrations/004_create_customers_table.sql`
2. Paste into the SQL Editor
3. Click "Run" or press `Ctrl+Enter`

### Step 3: Verify
You should see:
- ✅ "Success. No rows returned" message
- ✅ Run verification query:
```sql
SELECT * FROM customers LIMIT 5;
```

---

## 🎯 Features Implemented

### ✅ Auto-Code Generation
- Customers get auto-generated codes: CUST0001, CUST0002, etc.

### ✅ Validation
- Mobile numbers: 10-15 digits
- Email: Valid email format
- Pincode: Exactly 6 digits
- Customer type: individual or corporate

### ✅ Search
- Search by name, mobile, email, or company name
- Case-insensitive search
- Limit 20 results

### ✅ Soft Delete
- Deactivation instead of deletion
- is_active flag used

### ✅ Relationships
- Customer → Bookings (via mobile number)
- Booking history endpoint

### ✅ Stats Tracking
- Total bookings
- Total amount spent
- Total cancelled bookings
- Average rating

### ✅ Customer Types
- Individual customers
- Corporate customers (with GST)

---

## 📝 Sample Data

The migration includes 5 sample customers:
1. **CUST0001** - Rajesh Kumar (Individual)
2. **CUST0002** - Priya Sharma (Individual)
3. **CUST0003** - Tech Solutions Pvt Ltd (Corporate)
4. **CUST0004** - Arun Prakash (Individual)
5. **CUST0005** - Global Enterprises (Corporate)

---

## 🔄 Next Steps

### 1. Run Database Migration
```bash
# Copy SQL from: database/migrations/004_create_customers_table.sql
# Paste and run in Supabase SQL Editor
```

### 2. Restart Server
```bash
npm run start:dev
```

### 3. Test Endpoints
```bash
# Get all customers
curl http://localhost:3000/api/v1/customers

# Create a customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Customer",
    "mobile_primary": "9999999999",
    "email": "test@example.com"
  }'

# Search customers
curl "http://localhost:3000/api/v1/customers/search?q=rajesh"
```

### 4. Check Swagger Documentation
```
http://localhost:3000/api/docs
```
Look for the "Customers" tag!

---

## 🎊 Module Summary

### Total Modules: 4
1. ✅ Drivers (7 endpoints)
2. ✅ Vehicles (9 endpoints)
3. ✅ Bookings (7 endpoints)
4. ✅ **Customers (7 endpoints)** ← NEW!

### Total API Endpoints: 30

---

## 🚀 Ready to Go!

The Customers module is complete and ready for testing!

**எல்லாம் ready bro!** 🎉
