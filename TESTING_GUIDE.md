# 🧪 Testing Guide - Travel Operations Platform

## 📍 Quick Links

- **Server**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000

---

## 1️⃣ Test Drivers Module (7 Endpoints)

### A. GET All Drivers
```bash
# Method 1: Browser
http://localhost:3000/api/v1/drivers

# Method 2: Postman/Thunder Client
GET http://localhost:3000/api/v1/drivers

# Method 3: cURL
curl http://localhost:3000/api/v1/drivers

# Expected Response:
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### B. GET All Drivers with Filters
```bash
# Filter by status
http://localhost:3000/api/v1/drivers?status=available

# Filter by active status
http://localhost:3000/api/v1/drivers?isActive=true

# Search by name
http://localhost:3000/api/v1/drivers?search=Rajesh

# Combine filters
http://localhost:3000/api/v1/drivers?status=available&isActive=true&search=Kumar
```

### C. GET Available Drivers
```bash
GET http://localhost:3000/api/v1/drivers/available

# With date/time filters
http://localhost:3000/api/v1/drivers/available?date=2025-12-25&time=10:00
```

### D. GET Single Driver by ID
```bash
GET http://localhost:3000/api/v1/drivers/1

# Try different IDs
http://localhost:3000/api/v1/drivers/2
http://localhost:3000/api/v1/drivers/3
```

### E. CREATE New Driver
```bash
POST http://localhost:3000/api/v1/drivers
Content-Type: application/json

{
  "full_name": "Test Driver",
  "mobile_primary": "9876543399",
  "license_number": "TN09TEST123",
  "license_issue_date": "2020-01-01",
  "license_expiry_date": "2035-01-01",
  "badge_number": "BADGE099",
  "badge_expiry_date": "2027-12-31",
  "driver_type": "company_employed",
  "employment_start_date": "2025-01-01"
}
```

### F. UPDATE Driver
```bash
PUT http://localhost:3000/api/v1/drivers/1
Content-Type: application/json

{
  "mobile_alternate": "9876543388",
  "email": "driver@example.com"
}
```

### G. UPDATE Driver Status
```bash
PUT http://localhost:3000/api/v1/drivers/1/status
Content-Type: application/json

{
  "status": "on_trip"
}

# Valid statuses:
# - available
# - on_trip
# - on_break
# - off_duty
# - blocked
```

### H. DELETE (Deactivate) Driver
```bash
DELETE http://localhost:3000/api/v1/drivers/1

# Note: This is soft delete (sets is_active = false)
```

---

## 2️⃣ Test Vehicles Module (8 Endpoints)

### A. GET All Vehicles
```bash
GET http://localhost:3000/api/v1/vehicles

# Expected Response:
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### B. GET All Vehicles with Filters
```bash
# Filter by status
http://localhost:3000/api/v1/vehicles?status=available

# Filter by active
http://localhost:3000/api/v1/vehicles?isActive=true

# Filter by category
http://localhost:3000/api/v1/vehicles?categoryId=1

# Search
http://localhost:3000/api/v1/vehicles?search=TN09

# Combine filters
http://localhost:3000/api/v1/vehicles?status=available&categoryId=1&search=Maruti
```

### C. GET Available Vehicles
```bash
GET http://localhost:3000/api/v1/vehicles/available

# Filter by category
http://localhost:3000/api/v1/vehicles/available?categoryId=1
```

### D. GET Single Vehicle by ID
```bash
GET http://localhost:3000/api/v1/vehicles/1
```

### E. CREATE New Vehicle
```bash
POST http://localhost:3000/api/v1/vehicles
Content-Type: application/json

{
  "registration_number": "TN09TEST999",
  "make": "Toyota",
  "model": "Innova",
  "year": 2024,
  "color": "Silver",
  "vehicle_category_id": 2,
  "seat_capacity": 7,
  "fuel_type": "Diesel",
  "ownership_type": "company_owned",
  "rc_number": "RC999",
  "insurance_expiry_date": "2026-12-31",
  "fitness_expiry_date": "2027-12-31",
  "permit_expiry_date": "2027-12-31"
}
```

### F. UPDATE Vehicle
```bash
PUT http://localhost:3000/api/v1/vehicles/1
Content-Type: application/json

{
  "color": "Black",
  "current_mileage": 50000
}
```

### G. UPDATE Vehicle Status
```bash
PUT http://localhost:3000/api/v1/vehicles/1/status
Content-Type: application/json

{
  "status": "on_trip"
}

# Valid statuses:
# - available
# - on_trip
# - maintenance
# - idle
# - blocked
```

### H. UPDATE Vehicle Mileage
```bash
PUT http://localhost:3000/api/v1/vehicles/1/mileage
Content-Type: application/json

{
  "mileage": 55000
}
```

### I. DELETE (Deactivate) Vehicle
```bash
DELETE http://localhost:3000/api/v1/vehicles/1

# Note: This is soft delete (sets is_active = false)
```

---

## 3️⃣ Using Swagger UI (Easiest Way!)

### Step 1: Open Swagger
```
http://localhost:3000/api/docs
```

### Step 2: Test Endpoints
1. Click on any endpoint (e.g., `GET /api/v1/drivers`)
2. Click "Try it out"
3. Fill in parameters (if needed)
4. Click "Execute"
5. See the response below!

### Step 3: Test POST/PUT Endpoints
1. Click on `POST /api/v1/drivers`
2. Click "Try it out"
3. Edit the JSON in "Request body"
4. Click "Execute"
5. Check response!

---

## 4️⃣ Using Postman/Thunder Client

### Setup Collection:

#### 1. Create Environment
```
BASE_URL: http://localhost:3000
```

#### 2. Import Requests:

**Drivers:**
- GET {{BASE_URL}}/api/v1/drivers
- GET {{BASE_URL}}/api/v1/drivers/available
- GET {{BASE_URL}}/api/v1/drivers/:id
- POST {{BASE_URL}}/api/v1/drivers
- PUT {{BASE_URL}}/api/v1/drivers/:id
- PUT {{BASE_URL}}/api/v1/drivers/:id/status
- DELETE {{BASE_URL}}/api/v1/drivers/:id

**Vehicles:**
- GET {{BASE_URL}}/api/v1/vehicles
- GET {{BASE_URL}}/api/v1/vehicles/available
- GET {{BASE_URL}}/api/v1/vehicles/:id
- POST {{BASE_URL}}/api/v1/vehicles
- PUT {{BASE_URL}}/api/v1/vehicles/:id
- PUT {{BASE_URL}}/api/v1/vehicles/:id/status
- PUT {{BASE_URL}}/api/v1/vehicles/:id/mileage
- DELETE {{BASE_URL}}/api/v1/vehicles/:id

---

## 5️⃣ Testing Scenarios

### Scenario 1: Complete Driver Workflow
```
1. GET all drivers → See existing drivers
2. POST create new driver → Get driver_id
3. GET driver by ID → Verify creation
4. PUT update driver → Add email/phone
5. PUT update status to "on_trip" → Change status
6. PUT update status to "available" → Change back
7. DELETE deactivate driver → Soft delete
```

### Scenario 2: Complete Vehicle Workflow
```
1. GET all vehicles → See existing vehicles
2. POST create new vehicle → Get vehicle_id
3. GET vehicle by ID → Verify creation
4. PUT update vehicle → Change color
5. PUT update mileage → Update km
6. PUT update status to "maintenance" → Change status
7. PUT update status to "available" → Change back
8. DELETE deactivate vehicle → Soft delete
```

### Scenario 3: Search & Filter
```
1. GET drivers with search → Find specific driver
2. GET available drivers → See who's free
3. GET vehicles by category → Filter by type
4. GET available vehicles → See what's free
```

### Scenario 4: Edge Cases
```
1. GET driver with invalid ID (999) → Should return 404
2. POST driver with missing fields → Should return 400
3. PUT update with invalid status → Should return error
4. DELETE already deleted driver → Should handle gracefully
```

---

## 6️⃣ Expected Responses

### Success Response (200 OK)
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Created Response (201 Created)
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {...}
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Driver with ID 999 not found",
  "error": "Not Found"
}
```

### Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 7️⃣ Performance Testing

### Check Response Times
```bash
# Using cURL with time
time curl http://localhost:3000/api/v1/drivers

# Target: < 500ms
```

### Load Testing (Optional)
```bash
# Install autocannon
npm install -g autocannon

# Test endpoint
autocannon -c 10 -d 10 http://localhost:3000/api/v1/drivers
```

---

## 8️⃣ Common Issues & Solutions

### Issue 1: Server not running
```bash
# Check if server is running
curl http://localhost:3000

# If not, start it
cd E:/Projects/travel-ops-backend
npm run start:dev
```

### Issue 2: Port already in use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env
PORT=3001
```

### Issue 3: Database connection error
```bash
# Check .env file
# Verify SUPABASE_URL and SUPABASE_ANON_KEY
```

### Issue 4: 404 Not Found
```bash
# Check URL path
# Should be: /api/v1/drivers (not /drivers)
```

---

## 9️⃣ Testing Checklist

### Before Starting:
- [ ] Server is running (http://localhost:3000)
- [ ] Swagger UI loads (http://localhost:3000/api/docs)
- [ ] Database connected (no errors in console)

### Drivers Module:
- [ ] GET all drivers works
- [ ] GET drivers with filters works
- [ ] GET available drivers works
- [ ] GET single driver works
- [ ] POST create driver works
- [ ] PUT update driver works
- [ ] PUT update status works
- [ ] DELETE deactivate driver works

### Vehicles Module:
- [ ] GET all vehicles works
- [ ] GET vehicles with filters works
- [ ] GET available vehicles works
- [ ] GET single vehicle works
- [ ] POST create vehicle works
- [ ] PUT update vehicle works
- [ ] PUT update status works
- [ ] PUT update mileage works
- [ ] DELETE deactivate vehicle works

### Error Handling:
- [ ] Invalid ID returns 404
- [ ] Missing fields return 400
- [ ] Invalid status returns error
- [ ] Database errors handled

---

## 🔟 Next Steps After Testing

Once all tests pass:
1. ✅ Document any issues found
2. ✅ Fix any bugs
3. ✅ Optimize slow queries
4. ✅ Move to Option B (Build next modules)

---

## 📝 Test Results Template

Use this to track your testing:

```markdown
# Test Results - [Date]

## Drivers Module
- [ ] GET /drivers - ✅/❌ - Notes:
- [ ] GET /drivers/available - ✅/❌ - Notes:
- [ ] GET /drivers/:id - ✅/❌ - Notes:
- [ ] POST /drivers - ✅/❌ - Notes:
- [ ] PUT /drivers/:id - ✅/❌ - Notes:
- [ ] PUT /drivers/:id/status - ✅/❌ - Notes:
- [ ] DELETE /drivers/:id - ✅/❌ - Notes:

## Vehicles Module
- [ ] GET /vehicles - ✅/❌ - Notes:
- [ ] GET /vehicles/available - ✅/❌ - Notes:
- [ ] GET /vehicles/:id - ✅/❌ - Notes:
- [ ] POST /vehicles - ✅/❌ - Notes:
- [ ] PUT /vehicles/:id - ✅/❌ - Notes:
- [ ] PUT /vehicles/:id/status - ✅/❌ - Notes:
- [ ] PUT /vehicles/:id/mileage - ✅/❌ - Notes:
- [ ] DELETE /vehicles/:id - ✅/❌ - Notes:

## Issues Found
1.
2.
3.

## Performance
- Average response time:
- Slowest endpoint:
- Memory usage:
```

---

**Happy Testing! 🧪**

*Let me know if you find any issues!*
