# API Documentation

This directory contains comprehensive API documentation for all microservices in the Multi-Cloud DevOps Platform.

## Service APIs

### User Service
- **Base URL**: `http://user-service:3002`
- **Documentation**: [User Service API](user-service.md)
- **Endpoints**:
  - `POST /api/users/register` - User registration
  - `POST /api/users/login` - User authentication
  - `GET /api/users/profile` - Get user profile
  - `PUT /api/users/profile` - Update user profile

### Product Service
- **Base URL**: `http://product-service:3001`
- **Documentation**: [Product Service API](product-service.md)
- **Endpoints**:
  - `GET /api/products` - List all products
  - `GET /api/products/:id` - Get product details
  - `POST /api/products` - Create new product
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product

### Order Service
- **Base URL**: `http://order-service:3003`
- **Documentation**: [Order Service API](order-service.md)
- **Endpoints**:
  - `GET /api/orders/cart` - Get shopping cart
  - `POST /api/orders/cart/items` - Add item to cart
  - `DELETE /api/orders/cart/items/:id` - Remove item from cart
  - `POST /api/orders` - Create order
  - `GET /api/orders/:id` - Get order details

### Notification Service
- **Base URL**: `http://notification-service:3004`
- **Documentation**: [Notification Service API](notification-service.md)
- **Endpoints**:
  - `POST /api/notifications/send` - Send notification
  - `GET /api/notifications/templates` - List notification templates
  - `POST /api/notifications/templates` - Create notification template

## Authentication

All services use JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **User Service**: 100 requests per minute per IP
- **Product Service**: 200 requests per minute per IP
- **Order Service**: 50 requests per minute per IP
- **Notification Service**: 20 requests per minute per IP

## Health Checks

All services provide health check endpoints:
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
