# 🛒 Order Service

The Order Service handles shopping cart management, order processing, and payment simulation for our e-commerce platform. Think of it as the "checkout counter" that processes purchases and manages the entire order lifecycle.

## 🎯 What This Service Does

- **Shopping Cart Management**: Add, remove, and manage items in cart
- **Order Processing**: Convert cart to permanent orders
- **Payment Simulation**: Process payments (simulated for learning)
- **Order Tracking**: View order history and status
- **Inventory Integration**: Updates product stock when orders are placed
- **User Authentication**: Verifies users through User Service

## 🛍️ E-commerce Workflow

### 1. Shopping Cart Flow
```
User adds item → Check product availability → Add to cart → Calculate totals
```

### 2. Order Processing Flow
```
Cart checkout → Validate items → Process payment → Update inventory → Create order
```

### 3. Order Management Flow
```
Order created → Status updates → User tracking → Admin management
```

## 🚀 How to Run

### Prerequisites
- Node.js (version 14 or higher)
- User Service running on port 3002
- Product Service running on port 3001

### Installation
```bash
cd apps/order-service
npm install
```

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check for Kubernetes | No |
| GET | `/api/cart` | Get user's shopping cart | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| DELETE | `/api/cart/items/:productId` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear entire cart | Yes |
| POST | `/api/orders` | Create order from cart | Yes |
| GET | `/api/orders` | Get user's orders | Yes |
| GET | `/api/orders/:orderId` | Get specific order | Yes |
| PATCH | `/api/orders/:orderId/status` | Update order status (admin) | Yes (Admin) |

## 🔍 Example API Calls

### Add Item to Cart
```bash
curl -X POST http://localhost:3003/api/cart/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

### Get Shopping Cart
```bash
curl -X GET http://localhost:3003/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Order
```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 99.99
      }
    ],
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

### Get User Orders
```bash
curl -X GET http://localhost:3003/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 💰 Pricing Logic

### Subtotal Calculation
- Sum of (item price × quantity) for all items

### Shipping Cost
- **Free shipping**: Orders over $100
- **Standard shipping**: $10 for orders under $100

### Tax Calculation
- **Tax rate**: 8% of subtotal
- Applied to all orders

### Total Calculation
```
Total = Subtotal + Shipping + Tax
```

## 🔄 Service Integration

### User Service Integration
- **Token Verification**: Validates JWT tokens for authentication
- **User Context**: Gets user information for orders

### Product Service Integration
- **Product Validation**: Verifies products exist and are available
- **Stock Management**: Updates inventory when orders are placed
- **Price Verification**: Ensures accurate pricing

## 🏗️ Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓
CANCELLED (if payment fails)
```

### Status Descriptions
- **PENDING**: Order created, waiting for payment
- **CONFIRMED**: Payment successful, order confirmed
- **PROCESSING**: Order being prepared for shipment
- **SHIPPED**: Order dispatched to customer
- **DELIVERED**: Order received by customer
- **CANCELLED**: Order cancelled (payment failed or user request)

## 💳 Payment Simulation

The service includes a simulated payment processor:
- **Success Rate**: 90% (for testing purposes)
- **Processing Time**: 1 second delay
- **Payment Methods**: credit_card, debit_card, paypal
- **Real Integration**: In production, this would connect to Stripe, PayPal, etc.

## 🔒 Security Features

### Authentication
- JWT token verification through User Service
- User-specific cart and order access
- Admin-only order status updates

### Validation
- Input validation for all endpoints
- Product availability checking
- Stock level verification

### Error Handling
- Graceful failure for service unavailability
- Proper HTTP status codes
- Detailed error messages

## 🧪 Testing

The service includes comprehensive tests covering:
- Shopping cart operations
- Order creation and validation
- Payment processing simulation
- Service integration
- Error handling scenarios
- Authentication and authorization

Run `npm test` to verify everything is working.

## 🔧 Environment Variables

- `PORT`: Server port (default: 3003)
- `USER_SERVICE_URL`: User Service URL (default: http://localhost:3002)
- `PRODUCT_SERVICE_URL`: Product Service URL (default: http://localhost:3001)
- `NODE_ENV`: Environment (development, production)

## 🎓 Learning Concepts

### Microservices Communication
- **HTTP APIs**: Services communicate via REST APIs
- **Service Discovery**: Services know how to find each other
- **Error Handling**: Graceful degradation when services are unavailable

### E-commerce Patterns
- **Shopping Cart**: Temporary storage before checkout
- **Order Processing**: Converting cart to permanent order
- **Inventory Management**: Real-time stock updates
- **Payment Processing**: Secure payment handling

### Data Consistency
- **Eventual Consistency**: Services eventually sync data
- **Compensating Actions**: Rollback mechanisms for failures
- **Idempotency**: Safe to retry operations

## 🔄 Real-World Examples

### Amazon's Order Processing
1. **Cart Service**: Manages shopping cart
2. **Inventory Service**: Checks and reserves stock
3. **Payment Service**: Processes payment
4. **Order Service**: Creates and tracks orders
5. **Fulfillment Service**: Handles shipping

### Our Implementation
1. **Order Service**: Combines cart and order management
2. **Product Service**: Manages inventory
3. **User Service**: Handles authentication
4. **Future**: Separate Payment Service, Fulfillment Service

---

*This is part of a learning project to understand microservices architecture and DevOps practices.*
