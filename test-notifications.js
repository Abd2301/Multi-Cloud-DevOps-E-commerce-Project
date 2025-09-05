#!/usr/bin/env node

/**
 * Notification Testing Script
 * 
 * This script demonstrates how to test the notification system
 * and verify that all notification channels are working properly.
 */

const axios = require('axios');

// Service URLs
const USER_SERVICE_URL = 'http://localhost:3002';
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

async function testNotifications() {
  log('\n📧 Notification System Testing', 'bright');
  log('================================', 'bright');
  
  try {
    // Step 1: Try to register a test user (or use existing)
    log('\n👤 Step 1: Creating/Using Test User', 'blue');
    let userId;
    let authToken;
    
    try {
      const registerResponse = await axios.post(`${USER_SERVICE_URL}/api/users/register`, {
        email: 'aakjordan23@gmail.com',
        password: 'password123',
        firstName: 'Notification',
        lastName: 'Tester'
      });
      
      userId = registerResponse.data.data.id;
      log(`✅ User created: ${registerResponse.data.data.firstName} ${registerResponse.data.data.lastName}`, 'green');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        log(`ℹ️  User already exists, using existing user`, 'yellow');
      } else {
        throw error;
      }
    }
    
    // Step 2: Login to get authentication token
    log('\n🔐 Step 2: User Login', 'blue');
    const loginResponse = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      email: 'aakjordan23@gmail.com',
      password: 'password123'
    });
    
    authToken = loginResponse.data.data.token;
    userId = loginResponse.data.data.user.id;
    log(`✅ Login successful!`, 'green');
    
    // Step 3: Test Email Notifications
    log('\n📧 Step 3: Testing Email Notifications', 'blue');
    log('─────────────────────────────────────', 'blue');
    
    const emailNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
      userId: userId,
      type: 'email',
      subject: 'Test Email Notification',
      message: 'This is a test email notification to verify the system is working!',
      metadata: {
        testType: 'email_verification',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Email notification sent!`, 'green');
    log(`   Status: ${emailNotification.data.data.status}`, 'cyan');
    log(`   ID: ${emailNotification.data.data.id}`, 'cyan');
    
    // Step 4: Test SMS Notifications
    log('\n📱 Step 4: Testing SMS Notifications', 'blue');
    log('─────────────────────────────────────', 'blue');
    
    const smsNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
      userId: userId,
      type: 'sms',
      subject: 'Test SMS',
      message: 'This is a test SMS notification!',
      metadata: {
        testType: 'sms_verification',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ SMS notification sent!`, 'green');
    log(`   Status: ${smsNotification.data.data.status}`, 'cyan');
    log(`   ID: ${smsNotification.data.data.id}`, 'cyan');
    
    // Step 5: Test Push Notifications
    log('\n🔔 Step 5: Testing Push Notifications', 'blue');
    log('─────────────────────────────────────', 'blue');
    
    const pushNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
      userId: userId,
      type: 'push',
      subject: 'Test Push Notification',
      message: 'This is a test push notification!',
      metadata: {
        testType: 'push_verification',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Push notification sent!`, 'green');
    log(`   Status: ${pushNotification.data.data.status}`, 'cyan');
    log(`   ID: ${pushNotification.data.data.id}`, 'cyan');
    
    // Step 6: Test In-App Notifications
    log('\n📱 Step 6: Testing In-App Notifications', 'blue');
    log('─────────────────────────────────────────', 'blue');
    
    const inAppNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
      userId: userId,
      type: 'in_app',
      subject: 'Test In-App Notification',
      message: 'This is a test in-app notification!',
      metadata: {
        testType: 'in_app_verification',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ In-app notification sent!`, 'green');
    log(`   Status: ${inAppNotification.data.data.status}`, 'cyan');
    log(`   ID: ${inAppNotification.data.data.id}`, 'cyan');
    
    // Step 7: Test Template Notifications
    log('\n📋 Step 7: Testing Template Notifications', 'blue');
    log('─────────────────────────────────────────', 'blue');
    
    const templateNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/send-template`, {
      templateName: 'welcome_email',
      userId: userId,
      variables: {
        firstName: 'Notification',
        lastName: 'Tester'
      }
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Template notification sent!`, 'green');
    log(`   Template: welcome_email`, 'cyan');
    
    // Step 8: Test Event-Driven Notifications
    log('\n🔄 Step 8: Testing Event-Driven Notifications', 'blue');
    log('─────────────────────────────────────────────', 'blue');
    
    const eventNotification = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/events`, {
      eventType: 'user_registered',
      userId: userId,
      data: {
        firstName: 'Notification',
        lastName: 'Tester',
        email: 'aakjordan23@gmail.com'
      }
    });
    
    log(`✅ Event notification processed!`, 'green');
    log(`   Event: user_registered`, 'cyan');
    
    // Step 9: Get Notification Statistics
    log('\n📊 Step 9: Notification Statistics', 'blue');
    log('─────────────────────────────────', 'blue');
    
    const statsResponse = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Notification Statistics:`, 'green');
    log(`   Total notifications: ${statsResponse.data.data.total}`, 'cyan');
    log(`   Sent: ${statsResponse.data.data.sent}`, 'cyan');
    log(`   Failed: ${statsResponse.data.data.failed}`, 'cyan');
    log(`   By type:`, 'cyan');
    Object.entries(statsResponse.data.data.byType).forEach(([type, count]) => {
      log(`     ${type}: ${count}`, 'cyan');
    });
    
    // Step 10: Get All Notifications
    log('\n📋 Step 10: All Notifications', 'blue');
    log('─────────────────────────────', 'blue');
    
    const allNotifications = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ User has ${allNotifications.data.count} notifications:`, 'green');
    allNotifications.data.data.forEach((notification, index) => {
      log(`   ${index + 1}. [${notification.type.toUpperCase()}] ${notification.subject}`, 'cyan');
      log(`      Status: ${notification.status}`, 'cyan');
      log(`      Created: ${new Date(notification.createdAt).toLocaleString()}`, 'cyan');
    });
    
    // Step 11: Test Notification Templates
    log('\n📝 Step 11: Available Templates', 'blue');
    log('─────────────────────────────', 'blue');
    
    const templatesResponse = await axios.get(`${NOTIFICATION_SERVICE_URL}/api/notifications/templates`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    log(`✅ Available templates:`, 'green');
    templatesResponse.data.data.forEach((template, index) => {
      log(`   ${index + 1}. ${template.name} (${template.type})`, 'cyan');
      log(`      Subject: ${template.subject}`, 'cyan');
      log(`      Variables: ${template.variables.join(', ')}`, 'cyan');
    });
    
    // Final Summary
    log('\n🎉 Notification Testing Complete!', 'bright');
    log('==================================', 'bright');
    
    log('\n✅ What we tested:', 'green');
    log('   • Email notifications', 'cyan');
    log('   • SMS notifications', 'cyan');
    log('   • Push notifications', 'cyan');
    log('   • In-app notifications', 'cyan');
    log('   • Template-based notifications', 'cyan');
    log('   • Event-driven notifications', 'cyan');
    log('   • Notification statistics', 'cyan');
    log('   • Template management', 'cyan');
    
    log('\n🔍 How to verify notifications are working:', 'yellow');
    log('   1. Check the console output above for "Notification sent" messages', 'cyan');
    log('   2. Look for the notification IDs and statuses', 'cyan');
    log('   3. Verify the statistics show the correct counts', 'cyan');
    log('   4. Check that all notification types are supported', 'cyan');
    
    log('\n💡 In production, you would:', 'bright');
    log('   • Set up real email SMTP servers', 'cyan');
    log('   • Integrate with SMS providers (Twilio, AWS SNS)', 'cyan');
    log('   • Use push notification services (Firebase, OneSignal)', 'cyan');
    log('   • Store notifications in a database', 'cyan');
    log('   • Implement notification preferences', 'cyan');
    
  } catch (error) {
    log(`\n❌ Testing failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data.message}`, 'red');
    }
  }
}

// Run the notification test
testNotifications();
