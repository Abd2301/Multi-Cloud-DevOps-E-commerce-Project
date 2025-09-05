const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Think of these as security guards and helpers
app.use(helmet()); // Security headers (like wearing a helmet)
app.use(cors()); // Allow other services to talk to us
app.use(morgan('combined')); // Log requests (like a security camera)
app.use(express.json()); // Parse JSON requests

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

// Get all products
app.get('/api/products', (req, res) => {
  console.log('📦 Someone requested all products');
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
  
  console.log(`📦 Someone requested product ${productId}: ${product.name}`);
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
  
  console.log(`📦 Someone searched for products in category: ${category}`);
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
  console.log(`📦 Updated stock for product ${productId} to ${quantity}`);
  
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
  console.log(`🚀 Product Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔍 Search by category: http://localhost:${PORT}/api/products/category/electronics`);
});

module.exports = app;
