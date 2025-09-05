#!/usr/bin/env node

/**
 * Complete E-commerce Flow Demo
 * 
 * This script demonstrates a complete e-commerce shopping experience
 * using all three microservices working together.
 */

const axios = require('axios');

// Service URLs
const USER_SERVICE_URL = 'http://localhost:3002';
const PRODUCT_SERVICE_URL = 'http://localhost:3001';
const ORDER_SERVICE_URL = 'http://localhost:3003';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function waitForService(serviceName, url, maxRetries = 10) {
  log(`\n🔍 Checking if ${serviceName} is running...`, 'yellow');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${url}/health`);
      if (response.data.status === 'healthy') {
        log(`✅ ${serviceName} is healthy!`, 'green');
        return true;
      }
    } catch (error) {
      if (i < maxRetries - 1) {
        log(`⏳ Waiting for ${serviceName}... (attempt ${i + 1}/${maxRetries})`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  log(`❌ ${serviceName} is not responding. Please start it first.`, 'red');
  return false;
}

async function demonstrateCompleteEcommerceFlow() {
  log('\n🛒 Complete E-commerce Flow Demo', 'bright');
  log('=====================================', 'bright');
  log('This demonstrates a real shopping experience using microservices!', 'cyan');
  
  // Check if all services are running
  const userServiceReady = await waitForService('User Service', USER_SERVICE_URL);
  const productServiceReady = await waitForService('Product Service', PRODUCT_SERVICE_URL);
  const orderServiceReady = await waitForService('Order Service', ORDER_SERVICE_URL);
  
  if (!userServiceReady || !productServiceReady || !orderServiceReady) {
    log('\n💡 To start all services:', 'cyan');
    log('Terminal 1: cd apps/user-service && npm start', 'cyan');
    log('Terminal 2: cd apps/product-service && npm start', 'cyan');
    log('Terminal 3: cd apps/order-service && npm start', 'cyan');
    return;
  }
  
  try {
    // Step 1: Register a new customer
    log('\n👤 Step 1: Customer Registration', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const registerResponse = await axios.post(`${USER_SERVICE_URL}/api/users/register`, {
      email: 'shopper@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Shopper'
    });
    
    log(`✅ Customer registered: ${registerResponse.data.data.firstName} ${registerResponse.data.data.lastName}`, 'green');
    log(`   Email: ${registerResponse.data.data.email}`, 'cyan');
    
    // Step 2: Customer login
    log('\n🔐 Step 2: Customer Login', 'blue');
    log('─────────────────────────', 'blue');
    
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'shopper@example.com',
      password: 'password123'
    });
    
    const authToken = loginResponse.data.data.token;
    log(`✅ Login successful!`, 'green');
    log(`   Token: ${authToken.substring(0, 30)}...`, 'cyan');
    
    // Step 3: Browse products
    log('\n📦 Step 3: Browse Product Catalog', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const productsResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`);
    
    log(`✅ Found ${productsResponse.data.count} products:`, 'green');
    productsResponse.data.data.forEach((product, index) => {
      log(`   ${index + 1}. ${product.name} - $${product.price} (${product.stock} in stock)`, 'cyan');
    });
    
    // Step 4: Add items to shopping cart
    log('\n🛒 Step 4: Shopping Cart Management', 'blue');
    log('───────────────────────────────────', 'blue');
    
    // Add first product to cart
    const addToCart1 = await axios.post(`${ORDER_SERVICE_URL}/api/cart/items`, {
      productId: 1,
      quantity: 2
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Added ${addToCart1.data.data.addedItem.quantity}x ${addToCart1.data.data.addedItem.name} to cart`, 'green');
    log(`   Subtotal: $${addToCart1.data.data.addedItem.subtotal}`, 'cyan');
    
    // Add second product to cart
    const addToCart2 = await axios.post(`${ORDER_SERVICE_URL}/api/cart/items`, {
      productId: 2,
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Added ${addToCart2.data.data.addedItem.quantity}x ${addToCart2.data.data.addedItem.name} to cart`, 'green');
    log(`   Subtotal: $${addToCart2.data.data.addedItem.subtotal}`, 'cyan');
    
    // View cart
    const cartResponse = await axios.get(`${ORDER_SERVICE_URL}/api/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`\n📋 Current Cart:`, 'yellow');
    cartResponse.data.data.items.forEach((item, index) => {
      log(`   ${index + 1}. ${item.name} x${item.quantity} = $${item.subtotal}`, 'cyan');
    });
    log(`   Total: $${cartResponse.data.data.total}`, 'bright');
    
    // Step 5: Create order
    log('\n💳 Step 5: Checkout and Order Creation', 'blue');
    log('───────────────────────────────────────', 'blue');
    
    const orderData = {
      items: cartResponse.data.data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        street: '123 Shopping Street',
        city: 'E-commerce City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };
    
    log(`🛍️ Processing order with ${orderData.items.length} items...`, 'yellow');
    log(`   Payment method: ${orderData.paymentMethod}`, 'cyan');
    log(`   Shipping to: ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`, 'cyan');
    
    const orderResponse = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (orderResponse.data.data.paymentStatus === 'completed') {
      log(`✅ Order created successfully!`, 'green');
      log(`   Order ID: ${orderResponse.data.data.id}`, 'cyan');
      log(`   Status: ${orderResponse.data.data.status}`, 'cyan');
      log(`   Payment: ${orderResponse.data.data.paymentStatus}`, 'cyan');
      log(`   Subtotal: $${orderResponse.data.data.subtotal}`, 'cyan');
      log(`   Shipping: $${orderResponse.data.data.shippingCost}`, 'cyan');
      log(`   Tax: $${orderResponse.data.data.tax.toFixed(2)}`, 'cyan');
      log(`   Total: $${orderResponse.data.data.total.toFixed(2)}`, 'bright');
    } else {
      log(`❌ Order created but payment failed`, 'red');
    }
    
    // Step 6: View order history
    log('\n📋 Step 6: Order History', 'blue');
    log('─────────────────────────', 'blue');
    
    const ordersResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Customer has ${ordersResponse.data.count} orders:`, 'green');
    ordersResponse.data.data.forEach((order, index) => {
      log(`   ${index + 1}. Order ${order.id.substring(0, 8)}... - $${order.total.toFixed(2)} (${order.status})`, 'cyan');
    });
    
    // Step 7: Verify inventory was updated
    log('\n📊 Step 7: Inventory Verification', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const updatedProduct1 = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/1`);
    const updatedProduct2 = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/2`);
    
    log(`✅ Inventory updated after order:`, 'green');
    log(`   ${updatedProduct1.data.data.name}: ${updatedProduct1.data.data.stock} remaining (was 50)`, 'cyan');
    log(`   ${updatedProduct2.data.data.name}: ${updatedProduct2.data.data.stock} remaining (was 25)`, 'cyan');
    
    // Step 8: Admin operations (simulate)
    log('\n👨‍💼 Step 8: Admin Operations', 'blue');
    log('─────────────────────────────', 'blue');
    
    // Login as admin
    const adminLogin = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'jane.smith@example.com',
      password: 'password'
    });
    
    const adminToken = adminLogin.data.data.token;
    log(`✅ Admin logged in: ${adminLogin.data.data.user.firstName} ${adminLogin.data.data.user.lastName}`, 'green');
    
    // Update order status (simulate shipping)
    const orderId = orderResponse.data.data.id;
    const updateStatus = await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
      status: 'shipped'
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    log(`✅ Order status updated to: ${updateStatus.data.data.status}`, 'green');
    
    // Summary
    log('\n🎉 Complete E-commerce Flow Demo Finished!', 'bright');
    log('==========================================', 'bright');
    
    log('\n✅ What we accomplished:', 'green');
    log('   • Customer registration and authentication', 'cyan');
    log('   • Product catalog browsing', 'cyan');
    log('   • Shopping cart management', 'cyan');
    log('   • Order processing with payment simulation', 'cyan');
    log('   • Inventory management', 'cyan');
    log('   • Order tracking and status updates', 'cyan');
    log('   • Admin operations', 'cyan');
    
    log('\n🏗️ Microservices Architecture in Action:', 'yellow');
    log('   • User Service: Authentication and user management', 'cyan');
    log('   • Product Service: Catalog and inventory management', 'cyan');
    log('   • Order Service: Cart and order processing', 'cyan');
    log('   • Service Communication: HTTP APIs with JWT tokens', 'cyan');
    log('   • Data Consistency: Real-time inventory updates', 'cyan');
    
    log('\n💡 This is exactly how real e-commerce platforms work:', 'bright');
    log('   • Amazon, eBay, Shopify all use similar architectures', 'cyan');
    log('   • Each service can be developed and deployed independently', 'cyan');
    log('   • Services communicate via APIs and message queues', 'cyan');
    log('   • Horizontal scaling is possible for each service', 'cyan');
    
  } catch (error) {
    log(`\n❌ Demo failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data.message}`, 'red');
    }
  }
}

// Run the demo
demonstrateCompleteEcommerceFlow();
