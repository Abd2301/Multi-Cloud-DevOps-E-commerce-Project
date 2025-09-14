const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
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
  defaultMeta: { service: 'order-service' },
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
const PORT = process.env.PORT || 3003;

// Service URLs - In production, these would be environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

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

const ordersTotal = new client.Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status']
});

const cartOperations = new client.Counter({
  name: 'cart_operations_total',
  help: 'Total number of cart operations',
  labelNames: ['operation', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(ordersTotal);
register.registerMetric(cartOperations);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

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

// In-memory storage - In production, this would be a database
let orders = [];
const shoppingCarts = new Map(); // userId -> cart

// Function to clear orders (for testing)
const clearOrders = () => {
  orders = [];
};

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Validation schemas
const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required()
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal').required()
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/verify`, {
      token: token
    });

    if (response.data.success) {
      req.user = response.data.data;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Test endpoint to clear orders (for testing only)
if (process.env.NODE_ENV === 'test') {
  app.post('/test/clear-orders', (req, res) => {
    clearOrders();
    res.json({ success: true, message: 'Orders cleared' });
  });
}

// Get shopping cart
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cart = shoppingCarts.get(userId) || { items: [], total: 0 };

  logger.info('Cart retrieved', { userId, itemCount: cart.items.length });
  
  res.json({
    success: true,
    data: {
      userId,
      items: cart.items,
      total: cart.total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    }
  });
});

// Add item to cart
app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = addToCartSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { productId, quantity } = value;

    // Get product details from Product Service
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    
    if (!productResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productResponse.data.data;

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      });
    }

    // Get or create cart
    let cart = shoppingCarts.get(userId) || { items: [], total: 0 };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Save cart
    shoppingCarts.set(userId, cart);

    // Track cart operation
    cartOperations.labels('add', 'success').inc();
    logger.info('Item added to cart', { userId, productName: product.name, quantity });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: cart,
        addedItem: {
          productId,
          name: product.name,
          quantity,
          subtotal: product.price * quantity
        }
      }
    });

  } catch (error) {
    console.error('❌ Add to cart error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove item from cart
app.delete('/api/cart/items/:productId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const productId = parseInt(req.params.productId);
  
  const cart = shoppingCarts.get(userId);
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  const removedItem = cart.items.splice(itemIndex, 1)[0];
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  logger.info('Item removed from cart', { userId, productName: removedItem.name });

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: {
      cart: cart,
      removedItem: removedItem
    }
  });
});

// Clear cart
app.delete('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  shoppingCarts.delete(userId);
  
  logger.info('Cart cleared', { userId });

  res.json({
    success: true,
    message: 'Cart cleared'
  });
});

// Create order from cart
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { items, shippingAddress, paymentMethod } = value;

    // Verify all products exist and check stock
    for (const item of items) {
      const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
      
      if (!productResponse.data.success) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      const product = productResponse.data.data;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = {
      id: uuidv4(),
      userId,
      items: items.map(item => ({
        ...item,
        subtotal: item.price * item.quantity
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Track order creation
    ordersTotal.labels(ORDER_STATUS.PENDING).inc();

    // Simulate payment processing
    const paymentSuccess = await simulatePayment(paymentMethod, total);
    
    if (paymentSuccess) {
      order.status = ORDER_STATUS.CONFIRMED;
      order.paymentStatus = PAYMENT_STATUS.COMPLETED;
      
      // Update product stock
      for (const item of items) {
        await axios.patch(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`, {
          quantity: await getCurrentStock(item.productId) - item.quantity
        });
      }
      
      logger.info('Order created and confirmed', { orderId: order.id, userId });
    } else {
      order.status = ORDER_STATUS.CANCELLED;
      order.paymentStatus = PAYMENT_STATUS.FAILED;
      logger.error('Order payment failed', { orderId: order.id, userId });
    }

    orders.push(order);

    // Clear user's cart
    shoppingCarts.delete(userId);

    res.status(201).json({
      success: true,
      message: paymentSuccess ? 'Order created successfully' : 'Order created but payment failed',
      data: order
    });

  } catch (error) {
    console.error('❌ Create order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's orders (authenticated)
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(order => order.userId === userId);
  
  logger.info('User orders retrieved', { userId, orderCount: userOrders.length });
  
  res.json({
    success: true,
    data: userOrders,
    count: userOrders.length
  });
});

// Get all orders (public endpoint for testing)
app.get('/api/orders/public', (req, res) => {
  logger.info('Public orders endpoint accessed', { orderCount: orders.length });
  
  res.json({
    success: true,
    data: orders,
    count: orders.length,
    message: 'Public endpoint - use /api/orders with authentication for user-specific orders'
  });
});

// Get specific order
app.get('/api/orders/:orderId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  
  const order = orders.find(o => o.id === orderId && o.userId === userId);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// Update order status (admin only)
app.patch('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;
  const { status } = req.body;

  // Check if user is admin (this would come from user service in real app)
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  logger.info('Order status updated', { orderId, newStatus: status, adminId: userId });

  res.json({
    success: true,
    message: 'Order status updated',
    data: order
  });
});

// Helper function to simulate payment processing
async function simulatePayment(paymentMethod, amount) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 90% success rate
  return Math.random() > 0.1;
}

// Helper function to get current stock
async function getCurrentStock(productId) {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    return response.data.data.stock;
  } catch (error) {
    return 0;
  }
}

// 404 handler
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
  logger.info('Order Service started successfully', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  logger.info('Service endpoints available', {
    health: `http://localhost:${PORT}/health`,
    cart: `http://localhost:${PORT}/api/cart`,
    orders: `http://localhost:${PORT}/api/orders`,
    ordersPublic: `http://localhost:${PORT}/api/orders/public`
  });
  logger.info('Service connections', {
    userService: USER_SERVICE_URL,
    productService: PRODUCT_SERVICE_URL
  });
});

module.exports = app;
