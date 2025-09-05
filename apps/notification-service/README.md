# 📧 Notification Service

The Notification Service handles all messaging and notifications for our e-commerce platform. Think of it as the "messenger department" that keeps customers informed and engaged through various communication channels.

## 🎯 What This Service Does

- **Multi-Channel Notifications**: Email, SMS, Push, and In-App notifications
- **Template Management**: Reusable notification templates with variables
- **Event Processing**: Automatic notifications based on system events
- **User Engagement**: Personalized messages and marketing communications
- **System Alerts**: Admin notifications for system events and issues

## 📱 Notification Channels

### Email Notifications
- **Order Confirmations**: "Your order has been confirmed!"
- **Shipping Updates**: "Your package is on its way!"
- **Welcome Messages**: "Welcome to our store!"
- **Promotional**: "Special offer just for you!"

### SMS Alerts
- **Order Updates**: "Order #12345 shipped!"
- **Delivery Notifications**: "Package delivered!"
- **Security Alerts**: "Unusual login detected"

### Push Notifications
- **Mobile App**: "New products you might like!"
- **Real-time Updates**: "Order status changed"
- **Marketing**: "Flash sale starting now!"

### In-App Notifications
- **Dashboard Alerts**: "Your order is ready for pickup"
- **System Messages**: "Profile updated successfully"
- **Recommendations**: "Based on your purchases..."

## 🚀 How to Run

### Prerequisites
- Node.js (version 14 or higher)
- User Service running on port 3002
- Order Service running on port 3003
- Product Service running on port 3001

### Installation
```bash
cd apps/notification-service
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
| POST | `/api/notifications/send` | Send notification | Yes |
| POST | `/api/notifications/send-template` | Send template notification | Yes |
| GET | `/api/notifications` | Get user notifications | Yes |
| GET | `/api/notifications/templates` | Get notification templates | Yes |
| POST | `/api/notifications/templates` | Create notification template | Yes |
| POST | `/api/notifications/events` | Process event notifications | No |
| GET | `/api/notifications/stats` | Get notification statistics | Yes |

## 🔍 Example API Calls

### Send Email Notification
```bash
curl -X POST http://localhost:3004/api/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "email",
    "subject": "Order Confirmation",
    "message": "Your order has been confirmed!",
    "metadata": {
      "orderId": "12345",
      "total": 99.99
    }
  }'
```

### Send SMS Notification
```bash
curl -X POST http://localhost:3004/api/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "type": "sms",
    "subject": "Order Update",
    "message": "Your order #12345 has shipped!"
  }'
```

### Send Template Notification
```bash
curl -X POST http://localhost:3004/api/notifications/send-template \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "welcome_email",
    "userId": 1,
    "variables": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

### Get User Notifications
```bash
curl -X GET http://localhost:3004/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Process Event Notification
```bash
curl -X POST http://localhost:3004/api/notifications/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "order_created",
    "userId": 1,
    "data": {
      "orderId": "12345",
      "total": 99.99
    }
  }'
```

## 📧 Notification Templates

### Built-in Templates

#### Welcome Email
- **Name**: `welcome_email`
- **Type**: Email
- **Subject**: "Welcome to Our Store!"
- **Body**: "Hi {{firstName}}, welcome to our e-commerce platform!"
- **Variables**: `firstName`, `lastName`, `email`

#### Order Confirmation
- **Name**: `order_confirmation`
- **Type**: Email
- **Subject**: "Order Confirmed - {{orderId}}"
- **Body**: "Hi {{firstName}}, your order {{orderId}} has been confirmed! Total: ${{total}}"
- **Variables**: `firstName`, `orderId`, `total`

#### Order Shipped
- **Name**: `order_shipped`
- **Type**: Email
- **Subject**: "Your Order Has Shipped!"
- **Body**: "Hi {{firstName}}, your order {{orderId}} is on its way! Tracking: {{trackingNumber}}"
- **Variables**: `firstName`, `orderId`, `trackingNumber`

#### Low Stock Alert
- **Name**: `low_stock_alert`
- **Type**: Email
- **Subject**: "Low Stock Alert - {{productName}}"
- **Body**: "Alert: {{productName}} is running low on stock. Current stock: {{currentStock}}"
- **Variables**: `productName`, `currentStock`, `threshold`

## 🔄 Event-Driven Notifications

### Supported Events
- **USER_REGISTERED**: Send welcome email
- **USER_LOGIN**: Track user activity
- **ORDER_CREATED**: Send order confirmation
- **ORDER_CONFIRMED**: Send payment confirmation
- **ORDER_SHIPPED**: Send shipping notification
- **ORDER_DELIVERED**: Send delivery confirmation
- **ORDER_CANCELLED**: Send cancellation notice
- **LOW_STOCK**: Alert admins about low inventory
- **PAYMENT_FAILED**: Notify user of payment issues

### Event Processing Flow
```
Event Occurs → Event Service → Notification Service → Send Notification
```

## 🏗️ Architecture Patterns

### Template Engine
- **Variable Substitution**: `{{variableName}}` syntax
- **Dynamic Content**: Personalized messages
- **Reusable Templates**: Consistent messaging across channels

### Event-Driven Architecture
- **Webhook Endpoints**: Receive events from other services
- **Async Processing**: Non-blocking notification sending
- **Event Queuing**: Handle high-volume notification events

### Multi-Channel Strategy
- **Channel Selection**: Choose best channel for message type
- **Fallback Mechanisms**: Email if SMS fails
- **User Preferences**: Respect user communication preferences

## 🔒 Security Features

### Authentication
- JWT token verification through User Service
- User-specific notification access
- Admin-only template management

### Data Protection
- No sensitive data in logs
- Encrypted communication channels
- GDPR-compliant data handling

### Rate Limiting
- Prevent notification spam
- Respect user preferences
- Queue management for high volume

## 🧪 Testing

The service includes comprehensive tests covering:
- All notification channels (email, SMS, push, in-app)
- Template creation and usage
- Event processing
- User notification retrieval
- Statistics and analytics
- Error handling scenarios

Run `npm test` to verify everything is working.

## 🔧 Environment Variables

- `PORT`: Server port (default: 3004)
- `USER_SERVICE_URL`: User Service URL (default: http://localhost:3002)
- `ORDER_SERVICE_URL`: Order Service URL (default: http://localhost:3003)
- `PRODUCT_SERVICE_URL`: Product Service URL (default: http://localhost:3001)
- `NODE_ENV`: Environment (development, production)

## 🎓 Learning Concepts

### Notification Patterns
- **Event-Driven**: Notifications triggered by system events
- **Template-Based**: Reusable message templates
- **Multi-Channel**: Different channels for different message types
- **Personalization**: Dynamic content based on user data

### Real-World Examples
- **Amazon**: Order confirmations, shipping updates, recommendations
- **Netflix**: New content alerts, viewing recommendations
- **Uber**: Ride updates, driver notifications, promotional offers
- **Shopify**: Store notifications, order updates, marketing emails

## 🔄 Integration with Other Services

### User Service Integration
- **User Data**: Get user information for personalization
- **Preferences**: Respect user notification preferences
- **Authentication**: Verify user identity

### Order Service Integration
- **Order Events**: Process order-related notifications
- **Status Updates**: Send order status changes
- **Payment Events**: Handle payment-related notifications

### Product Service Integration
- **Inventory Events**: Low stock alerts
- **Product Updates**: New product notifications
- **Recommendations**: Personalized product suggestions

## 📊 Analytics and Monitoring

### Notification Statistics
- **Delivery Rates**: Success/failure rates by channel
- **User Engagement**: Open rates, click rates
- **Performance Metrics**: Response times, queue sizes

### Health Monitoring
- **Service Health**: Uptime and availability
- **Queue Status**: Pending notification count
- **Error Rates**: Failed notification tracking

---

*This is part of a learning project to understand microservices architecture and DevOps practices.*
