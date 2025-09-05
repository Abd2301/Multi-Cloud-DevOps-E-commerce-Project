# 🧪 Complete Testing Guide

This guide shows you how to test all services and verify that the notification system is working properly.

## 🎯 Quick Test Summary

| Service | Tests | Status |
|---------|-------|---------|
| **User Service** | 15/15 | ✅ PASSED |
| **Product Service** | 6/6 | ✅ PASSED |
| **Order Service** | 17/17 | ✅ PASSED |
| **Notification Service** | 18/18 | ✅ PASSED |
| **TOTAL** | **56/56** | ✅ **ALL PASSED** |

## 🚀 How to Run All Tests

### Option 1: Run All Tests at Once
```bash
npm run test-all
```

### Option 2: Run Tests Individually
```bash
# User Service
cd apps/user-service && npm test

# Product Service
cd apps/product-service && npm test

# Order Service
cd apps/order-service && NODE_ENV=test npm test

# Notification Service
cd apps/notification-service && npm test
```

## 📧 How to Test Notifications

### Step 1: Start All Services
```bash
# Terminal 1: User Service
cd apps/user-service && npm start

# Terminal 2: Product Service
cd apps/product-service && npm start

# Terminal 3: Order Service
cd apps/order-service && npm start

# Terminal 4: Notification Service
cd apps/notification-service && npm start
```

### Step 2: Run Notification Test
```bash
node test-notifications.js
```

### Step 3: Run Complete Platform Demo
```bash
npm run demo-platform
```

## 🔍 What to Look For

### ✅ Successful Test Indicators

#### 1. Test Output
- All tests should show "PASS" status
- No error messages or failures
- All assertions should pass

#### 2. Notification Console Output
Look for these messages in the console:
```
📧 [EMAIL] To: user@example.com, Subject: Test Email
📱 [SMS] To: 1234567890, Message: Test SMS
🔔 [PUSH] To: 1, Title: Test Push, Message: Test Push
📱 [IN-APP] To: 1, Title: Test In-App, Message: Test In-App
📧 Notification sent to user 1: email - Test Email
```

#### 3. API Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (expected for validation tests)
- `401` - Unauthorized (expected for auth tests)
- `404` - Not Found (expected for missing resource tests)

#### 4. Health Check Endpoints
All services should respond to health checks:
```bash
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Notification Service
```

## 🧪 Manual Testing Scenarios

### 1. User Registration and Login
```bash
# Register a new user
curl -X POST http://localhost:3002/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login and get token
curl -X POST http://localhost:3002/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Product Catalog
```bash
# Get all products
curl http://localhost:3001/api/products

# Get specific product
curl http://localhost:3001/api/products/1

# Search by category
curl http://localhost:3001/api/products/category/electronics
```

### 3. Shopping Cart and Orders
```bash
# Add item to cart (replace TOKEN with actual token)
curl -X POST http://localhost:3003/api/cart/items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'

# Get cart
curl -X GET http://localhost:3003/api/cart \
  -H "Authorization: Bearer TOKEN"

# Create order
curl -X POST http://localhost:3003/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 2, "price": 99.99}],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "paymentMethod": "credit_card"
  }'
```

### 4. Notifications
```bash
# Send email notification (replace TOKEN with actual token)
curl -X POST http://localhost:3004/api/notifications/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "email",
    "subject": "Test Email",
    "message": "This is a test email notification"
  }'

# Send SMS notification
curl -X POST http://localhost:3004/api/notifications/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "sms",
    "subject": "Test SMS",
    "message": "This is a test SMS notification"
  }'

# Send template notification
curl -X POST http://localhost:3004/api/notifications/send-template \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "welcome_email",
    "userId": 1,
    "variables": {
      "firstName": "Test",
      "lastName": "User"
    }
  }'

# Get user notifications
curl -X GET http://localhost:3004/api/notifications \
  -H "Authorization: Bearer TOKEN"

# Get notification statistics
curl -X GET http://localhost:3004/api/notifications/stats \
  -H "Authorization: Bearer TOKEN"
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Kill the process
kill -9 <PID>
```

#### 2. Service Not Starting
- Check if all dependencies are installed: `npm install`
- Check for syntax errors in the code
- Verify all environment variables are set

#### 3. Tests Failing
- Make sure all services are running
- Check if ports are available
- Verify database connections (if using real databases)

#### 4. Notification Not Working
- Check if Notification Service is running
- Verify User Service is running (for authentication)
- Check console output for error messages
- Verify JWT token is valid

### Debug Commands

#### Check Service Health
```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

#### Check Service Logs
Look at the console output when running services. You should see:
- Service startup messages
- API request logs
- Notification sending logs
- Error messages (if any)

#### Test Service Communication
```bash
# Test if services can communicate
curl -X POST http://localhost:3002/api/users/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-jwt-token"}'
```

## 📊 Performance Testing

### Load Testing (Optional)
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test script
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get products"
    requests:
      - get:
          url: "/api/products"
EOF

# Run load test
artillery run load-test.yml
```

## 🎯 Success Criteria

### ✅ All Tests Pass
- 56/56 tests should pass
- No error messages
- All assertions successful

### ✅ Services Communicate
- User Service can verify tokens
- Order Service can get user info
- Notification Service can get user details
- All services respond to health checks

### ✅ Notifications Work
- All notification types (email, SMS, push, in-app) work
- Template notifications work
- Event-driven notifications work
- Statistics are accurate

### ✅ Complete E-commerce Flow
- User can register and login
- User can browse products
- User can add items to cart
- User can create orders
- User receives notifications
- Admin can manage orders

## 🚀 Next Steps

Once all tests pass, you can:
1. **Containerize** with Docker
2. **Orchestrate** with Kubernetes
3. **Deploy** to cloud platforms
4. **Monitor** with observability tools
5. **Scale** horizontally

---

*This testing guide ensures your e-commerce platform is working correctly and ready for production deployment.*
