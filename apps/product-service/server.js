const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const client = require('prom-client');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'product-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);

// Middleware - Think of these as security guards and helpers
app.use(helmet()); // Security headers (like wearing a helmet)
app.use(cors()); // Allow other services to talk to us
app.use(morgan('combined')); // Log requests (like a security camera)
app.use(express.json()); // Parse JSON requests

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
    
    activeConnections.dec();
  });
  
  next();
});

// Sample product data - In real world, this would come from a database
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    stock: 50,
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    id: 2,
    name: "Coffee Maker",
    price: 79.99,
    category: "Kitchen",
    stock: 25,
    description: "Programmable coffee maker with 12-cup capacity"
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 129.99,
    category: "Sports",
    stock: 30,
    description: "Comfortable running shoes for all terrains"
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 49.99,
    category: "Office",
    stock: 15,
    description: "Adjustable aluminum laptop stand for better ergonomics"
  }
];

// Health check endpoint - Kubernetes needs this to know if we're alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Get all products
app.get('/api/products', (req, res) => {
  logger.info('Products requested', { count: products.length });
  res.json({
    success: true,
    data: products,
    count: products.length
  });
});

// Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  logger.info('Product requested', { productId, name: product.name });
  res.json({
    success: true,
    data: product
  });
});

// Search products by category
app.get('/api/products/category/:category', (req, res) => {
  const category = req.params.category.toLowerCase();
  const filteredProducts = products.filter(p => 
    p.category.toLowerCase() === category
  );
  
  logger.info('Products searched by category', { category, count: filteredProducts.length });
  res.json({
    success: true,
    data: filteredProducts,
    count: filteredProducts.length,
    category: category
  });
});

// Update product stock (simulated)
app.patch('/api/products/:id/stock', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  if (quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity cannot be negative'
    });
  }
  
  product.stock = quantity;
  logger.info('Product stock updated', { productId, newStock: quantity, productName: product.name });
  
  res.json({
    success: true,
    data: product,
    message: 'Stock updated successfully'
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info('Product Service started successfully', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  logger.info('Service endpoints available', {
    health: `http://localhost:${PORT}/health`,
    products: `http://localhost:${PORT}/api/products`,
    category: `http://localhost:${PORT}/api/products/category/electronics`
  });
});

module.exports = app;
