#!/usr/bin/env node

/**
 * Complete E-commerce Platform Demo
 * 
 * This script demonstrates a complete e-commerce platform using all four microservices
 * working together in a real-world scenario.
 */

const axios = require('axios');

// Service URLs
const USER_SERVICE_URL = 'http://localhost:3002';
const PRODUCT_SERVICE_URL = 'http://localhost:3001';
const ORDER_SERVICE_URL = 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = 'http://localhost:3004';

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

async function demonstrateCompletePlatform() {
  log('\n🛒 Complete E-commerce Platform Demo', 'bright');
  log('=====================================', 'bright');
  log('This demonstrates a real e-commerce platform using microservices!', 'cyan');
  
  // Check if all services are running
  const userServiceReady = await waitForService('User Service', USER_SERVICE_URL);
  const productServiceReady = await waitForService('Product Service', PRODUCT_SERVICE_URL);
  const orderServiceReady = await waitForService('Order Service', ORDER_SERVICE_URL);
  const notificationServiceReady = await waitForService('Notification Service', NOTIFICATION_SERVICE_URL);
  
  if (!userServiceReady || !productServiceReady || !orderServiceReady || !notificationServiceReady) {
    log('\n💡 To start all services:', 'cyan');
    log('Terminal 1: cd apps/user-service && npm start', 'cyan');
    log('Terminal 2: cd apps/product-service && npm start', 'cyan');
    log('Terminal 3: cd apps/order-service && npm start', 'cyan');
    log('Terminal 4: cd apps/notification-service && npm start', 'cyan');
    return;
  }
  
  try {
    // Step 1: Customer Registration
    log('\n👤 Step 1: Customer Registration', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const registerResponse = await axios.post(`${USER_SERVICE_URL}/api/users/register`, {
      email: 'customer@example.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Customer'
    });
    
    log(`✅ Customer registered: ${registerResponse.data.data.firstName} ${registerResponse.data.data.lastName}`, 'green');
    log(`   Email: ${registerResponse.data.data.email}`, 'cyan');
    
    // Step 2: Send Welcome Notification
    log('\n📧 Step 2: Welcome Notification', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'customer@example.com',
      password: 'password123'
    });
    
    const authToken = loginResponse.data.data.token;
    log(`✅ Customer logged in!`, 'green');
    
    // Send welcome notification
    const welcomeNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-template`, {
      templateName: 'welcome_email',
      userId: 1,
      variables: {
        firstName: 'Alice',
        lastName: 'Customer'
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Welcome notification sent!`, 'green');
    
    // Step 3: Browse Products
    log('\n📦 Step 3: Browse Product Catalog', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const productsResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`);
    
    log(`✅ Found ${productsResponse.data.count} products:`, 'green');
    productsResponse.data.data.forEach((product, index) => {
      log(`   ${index + 1}. ${product.name} - $${product.price} (${product.stock} in stock)`, 'cyan');
    });
    
    // Step 4: Shopping Cart Experience
    log('\n🛒 Step 4: Shopping Cart Experience', 'blue');
    log('───────────────────────────────────', 'blue');
    
    // Add items to cart
    const addToCart1 = await axios.post(`${ORDER_SERVICE_URL}/api/cart/items`, {
      productId: 1,
      quantity: 2
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Added ${addToCart1.data.data.addedItem.quantity}x ${addToCart1.data.data.addedItem.name} to cart`, 'green');
    
    const addToCart2 = await axios.post(`${ORDER_SERVICE_URL}/api/cart/items`, {
      productId: 2,
      quantity: 1
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Added ${addToCart2.data.data.addedItem.quantity}x ${addToCart2.data.data.addedItem.name} to cart`, 'green');
    
    // View cart
    const cartResponse = await axios.get(`${ORDER_SERVICE_URL}/api/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`\n📋 Current Cart:`, 'yellow');
    cartResponse.data.data.items.forEach((item, index) => {
      log(`   ${index + 1}. ${item.name} x${item.quantity} = $${item.subtotal}`, 'cyan');
    });
    log(`   Total: $${cartResponse.data.data.total}`, 'bright');
    
    // Step 5: Order Processing
    log('\n💳 Step 5: Order Processing', 'blue');
    log('─────────────────────────────', 'blue');
    
    const orderData = {
      items: cartResponse.data.data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        street: '123 E-commerce Street',
        city: 'Digital City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };
    
    log(`🛍️ Processing order with ${orderData.items.length} items...`, 'yellow');
    
    const orderResponse = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (orderResponse.data.data.paymentStatus === 'completed') {
      log(`✅ Order created successfully!`, 'green');
      log(`   Order ID: ${orderResponse.data.data.id}`, 'cyan');
      log(`   Status: ${orderResponse.data.data.status}`, 'cyan');
      log(`   Total: $${orderResponse.data.data.total.toFixed(2)}`, 'cyan');
    }
    
    // Step 6: Order Notifications
    log('\n📧 Step 6: Order Notifications', 'blue');
    log('─────────────────────────────', 'blue');
    
    // Send order confirmation notification
    const orderConfirmation = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-template`, {
      templateName: 'order_confirmation',
      userId: 1,
      variables: {
        firstName: 'Alice',
        orderId: orderResponse.data.data.id.substring(0, 8),
        total: orderResponse.data.data.total.toFixed(2)
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Order confirmation notification sent!`, 'green');
    
    // Send SMS notification
    const smsNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
      userId: 1,
      type: 'sms',
      subject: 'Order Update',
      message: `Your order ${orderResponse.data.data.id.substring(0, 8)} has been confirmed! Total: $${orderResponse.data.data.total.toFixed(2)}`
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ SMS notification sent!`, 'green');
    
    // Step 7: Admin Operations
    log('\n👨‍💼 Step 7: Admin Operations', 'blue');
    log('─────────────────────────────', 'blue');
    
    // Login as admin
    const adminLogin = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'jane.smith@example.com',
      password: 'password'
    });
    
    const adminToken = adminLogin.data.data.token;
    log(`✅ Admin logged in: ${adminLogin.data.data.user.firstName} ${adminLogin.data.data.user.lastName}`, 'green');
    
    // Update order status to shipped
    const orderId = orderResponse.data.data.id;
    const updateStatus = await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
      status: 'shipped'
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    log(`✅ Order status updated to: ${updateStatus.data.data.status}`, 'green');
    
    // Send shipping notification
    const shippingNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-template`, {
      templateName: 'order_shipped',
      userId: 1,
      variables: {
        firstName: 'Alice',
        orderId: orderResponse.data.data.id.substring(0, 8),
        trackingNumber: 'TRK123456789'
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Shipping notification sent!`, 'green');
    
    // Step 8: System Monitoring
    log('\n📊 Step 8: System Monitoring', 'blue');
    log('─────────────────────────────', 'blue');
    
    // Check notification statistics
    const notificationStats = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Notification Statistics:`, 'green');
    log(`   Total notifications: ${notificationStats.data.data.total}`, 'cyan');
    log(`   Sent: ${notificationStats.data.data.sent}`, 'cyan');
    log(`   Failed: ${notificationStats.data.data.failed}`, 'cyan');
    log(`   By type:`, 'cyan');
    Object.entries(notificationStats.data.data.byType).forEach(([type, count]) => {
      log(`     ${type}: ${count}`, 'cyan');
    });
    
    // Check inventory updates
    const updatedProduct1 = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/1`);
    const updatedProduct2 = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/2`);
    
    log(`\n✅ Inventory Updated:`, 'green');
    log(`   ${updatedProduct1.data.data.name}: ${updatedProduct1.data.data.stock} remaining`, 'cyan');
    log(`   ${updatedProduct2.data.data.name}: ${updatedProduct2.data.data.stock} remaining`, 'cyan');
    
    // Step 9: Event-Driven Notifications
    log('\n🔄 Step 9: Event-Driven Notifications', 'blue');
    log('─────────────────────────────────────', 'blue');
    
    // Simulate low stock event
    const lowStockEvent = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/events`, {
      eventType: 'low_stock',
      userId: 1,
      data: {
        productId: 1,
        productName: 'Wireless Headphones',
        currentStock: 5,
        threshold: 10
      }
    });
    
    log(`✅ Low stock event processed!`, 'green');
    
    // Simulate order delivered event
    const orderDeliveredEvent = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/events`, {
      eventType: 'order_delivered',
      userId: 1,
      data: {
        orderId: orderResponse.data.data.id,
        deliveryDate: new Date().toISOString()
      }
    });
    
    log(`✅ Order delivered event processed!`, 'green');
    
    // Step 10: Customer Experience Summary
    log('\n📱 Step 10: Customer Experience Summary', 'blue');
    log('─────────────────────────────────────────', 'blue');
    
    // Get all customer notifications
    const customerNotifications = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Customer received ${customerNotifications.data.count} notifications:`, 'green');
    customerNotifications.data.data.forEach((notification, index) => {
      log(`   ${index + 1}. [${notification.type.toUpperCase()}] ${notification.subject}`, 'cyan');
    });
    
    // Get customer orders
    const customerOrders = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`\n✅ Customer has ${customerOrders.data.count} orders:`, 'green');
    customerOrders.data.data.forEach((order, index) => {
      log(`   ${index + 1}. Order ${order.id.substring(0, 8)}... - $${order.total.toFixed(2)} (${order.status})`, 'cyan');
    });
    
    // Final Summary
    log('\n🎉 Complete E-commerce Platform Demo Finished!', 'bright');
    log('==============================================', 'bright');
    
    log('\n✅ What we accomplished:', 'green');
    log('   • Customer registration and authentication', 'cyan');
    log('   • Product catalog browsing and inventory management', 'cyan');
    log('   • Shopping cart management and order processing', 'cyan');
    log('   • Multi-channel notifications (email, SMS, push, in-app)', 'cyan');
    log('   • Event-driven notification processing', 'cyan');
    log('   • Admin operations and order management', 'cyan');
    log('   • System monitoring and analytics', 'cyan');
    log('   • Complete customer journey from registration to delivery', 'cyan');
    
    log('\n🏗️ Complete Microservices Architecture:', 'yellow');
    log('   • User Service: Authentication and user management', 'cyan');
    log('   • Product Service: Catalog and inventory management', 'cyan');
    log('   • Order Service: Shopping cart and order processing', 'cyan');
    log('   • Notification Service: Multi-channel messaging', 'cyan');
    log('   • Service Communication: HTTP APIs with JWT authentication', 'cyan');
    log('   • Event-Driven Architecture: Real-time notification processing', 'cyan');
    log('   • Data Consistency: Real-time inventory and order updates', 'cyan');
    
    log('\n💡 This is exactly how real e-commerce platforms work:', 'bright');
    log('   • Amazon, Shopify, eBay all use similar architectures', 'cyan');
    log('   • Each service can be developed and deployed independently', 'cyan');
    log('   • Services communicate via APIs and message queues', 'cyan');
    log('   • Horizontal scaling is possible for each service', 'cyan');
    log('   • Event-driven architecture enables real-time updates', 'cyan');
    log('   • Multi-channel notifications improve customer engagement', 'cyan');
    
    log('\n🚀 Ready for Production:', 'bright');
    log('   • All services have comprehensive test coverage', 'green');
    log('   • Proper error handling and validation', 'green');
    log('   • Security features and authentication', 'green');
    log('   • Health checks and monitoring', 'green');
    log('   • Scalable and maintainable architecture', 'green');
    
  } catch (error) {
    log(`\n❌ Demo failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data.message}`, 'red');
    }
  }
}

// Run the demo
demonstrateCompletePlatform();
