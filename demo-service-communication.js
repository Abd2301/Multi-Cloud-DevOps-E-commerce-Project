#!/usr/bin/env node

/**
 * Demo: How Microservices Communicate
 * 
 * This script demonstrates how our User Service and Product Service
 * can work together in a real e-commerce scenario.
 */

const axios = require('axios');

// Service URLs
const USER_SERVICE_URL = 'http://localhost:3002';
const PRODUCT_SERVICE_URL = 'http://localhost:3001';

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

async function demonstrateServiceCommunication() {
  log('\n🚀 Microservices Communication Demo', 'bright');
  log('=====================================', 'bright');
  
  // Check if services are running
  const userServiceReady = await waitForService('User Service', USER_SERVICE_URL);
  const productServiceReady = await waitForService('Product Service', PRODUCT_SERVICE_URL);
  
  if (!userServiceReady || !productServiceReady) {
    log('\n💡 To start the services:', 'cyan');
    log('Terminal 1: cd apps/user-service && npm start', 'cyan');
    log('Terminal 2: cd apps/product-service && npm start', 'cyan');
    return;
  }
  
  try {
    // Step 1: Register a new user
    log('\n📝 Step 1: Registering a new user...', 'blue');
    const registerResponse = await axios.post(`${USER_SERVICE_URL}/api/users/register`, {
      email: 'demo@example.com',
      password: 'password123',
      firstName: 'Demo',
      lastName: 'User'
    });
    
    log(`✅ User registered: ${registerResponse.data.data.email}`, 'green');
    
    // Step 2: Login to get authentication token
    log('\n🔐 Step 2: Logging in to get authentication token...', 'blue');
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'demo@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    log(`✅ Login successful! Token: ${token.substring(0, 20)}...`, 'green');
    
    // Step 3: Get user profile (authenticated request)
    log('\n👤 Step 3: Getting user profile with authentication...', 'blue');
    const profileResponse = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    log(`✅ Profile retrieved: ${profileResponse.data.data.firstName} ${profileResponse.data.data.lastName}`, 'green');
    
    // Step 4: Browse products (no authentication needed)
    log('\n📦 Step 4: Browsing products...', 'blue');
    const productsResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products`);
    
    log(`✅ Found ${productsResponse.data.count} products:`, 'green');
    productsResponse.data.data.forEach(product => {
      log(`   - ${product.name}: $${product.price} (${product.stock} in stock)`, 'cyan');
    });
    
    // Step 5: Simulate authenticated product request
    log('\n🔒 Step 5: Simulating authenticated product request...', 'blue');
    
    // First, verify the token with User Service
    const verifyResponse = await axios.post(`${USER_SERVICE_URL}/api/users/verify`, {
      token: token
    });
    
    log(`✅ Token verified for user: ${verifyResponse.data.data.email}`, 'green');
    
    // Now get a specific product (simulating a logged-in user viewing product details)
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/1`);
    log(`✅ Product details retrieved: ${productResponse.data.data.name}`, 'green');
    
    // Step 6: Demonstrate error handling
    log('\n❌ Step 6: Demonstrating error handling...', 'blue');
    
    try {
      // Try to access profile without token
      await axios.get(`${USER_SERVICE_URL}/api/users/profile`);
    } catch (error) {
      log(`✅ Correctly rejected unauthenticated request: ${error.response.data.message}`, 'green');
    }
    
    try {
      // Try to get non-existent product
      await axios.get(`${PRODUCT_SERVICE_URL}/api/products/999`);
    } catch (error) {
      log(`✅ Correctly handled missing product: ${error.response.data.message}`, 'green');
    }
    
    // Summary
    log('\n🎉 Demo Complete!', 'bright');
    log('==================', 'bright');
    log('✅ User Service: Handles authentication and user management', 'green');
    log('✅ Product Service: Manages product catalog', 'green');
    log('✅ Service Communication: Services can verify tokens and work together', 'green');
    log('✅ Error Handling: Proper error responses for invalid requests', 'green');
    
    log('\n💡 This is how real microservices work in production:', 'cyan');
    log('   - Each service has a specific responsibility', 'cyan');
    log('   - Services communicate via HTTP APIs', 'cyan');
    log('   - Authentication tokens are shared between services', 'cyan');
    log('   - Each service can be developed and deployed independently', 'cyan');
    
  } catch (error) {
    log(`\n❌ Demo failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data.message}`, 'red');
    }
  }
}

// Run the demo
demonstrateServiceCommunication();
