# 📦 Product Service

The Product Service is responsible for managing the product catalog in our e-commerce platform. Think of it as the "catalog department" that knows everything about what's for sale.

## 🎯 What This Service Does

- **Product Catalog**: Shows all available products
- **Product Details**: Provides detailed information about specific products
- **Category Search**: Find products by category (Electronics, Kitchen, etc.)
- **Stock Management**: Track and update product inventory
- **Health Monitoring**: Provides health status for Kubernetes

## 🚀 How to Run

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
cd apps/product-service
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check for Kubernetes |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get specific product by ID |
| GET | `/api/products/category/:category` | Search products by category |
| PATCH | `/api/products/:id/stock` | Update product stock |

## 🔍 Example API Calls

### Get All Products
```bash
curl http://localhost:3001/api/products
```

### Get Specific Product
```bash
curl http://localhost:3001/api/products/1
```

### Search by Category
```bash
curl http://localhost:3001/api/products/category/electronics
```

### Update Stock
```bash
curl -X PATCH http://localhost:3001/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

## 🏗️ Architecture Notes

This service follows the **Single Responsibility Principle** - it only handles product-related operations. Other services (like User Service, Order Service) will handle their own responsibilities.

In a real-world scenario, this service would connect to a database (like PostgreSQL or MongoDB) instead of using in-memory data.

## 🔧 Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development, production)

## 🧪 Testing

The service includes basic tests to ensure all endpoints work correctly. Run `npm test` to verify everything is working.

---

*This is part of a learning project to understand microservices architecture and DevOps practices.*
