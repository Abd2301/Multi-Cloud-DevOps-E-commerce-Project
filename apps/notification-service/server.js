const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3004;

// Service URLs - In production, these would be environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage - In production, this would be a database
let notifications = [];
let notificationTemplates = new Map();
let notificationQueue = [];

// Notification types
const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

// Notification statuses
const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered'
};

// Event types that trigger notifications
const EVENT_TYPES = {
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  ORDER_CREATED: 'order_created',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  LOW_STOCK: 'low_stock',
  PAYMENT_FAILED: 'payment_failed',
  WELCOME: 'welcome',
  PROMOTIONAL: 'promotional'
};

// Validation schemas
const sendNotificationSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
  metadata: Joi.object().optional()
});

const createTemplateSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  variables: Joi.array().items(Joi.string()).optional()
});

// Email transporter (for demo purposes - uses fake SMTP)
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal.pass'
  }
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

// Initialize default notification templates
const initializeTemplates = () => {
  // Welcome email template
  notificationTemplates.set('welcome_email', {
    name: 'welcome_email',
    type: NOTIFICATION_TYPES.EMAIL,
    subject: 'Welcome to Our Store!',
    body: 'Hi {{firstName}}, welcome to our e-commerce platform! We\'re excited to have you on board.',
    variables: ['firstName', 'lastName', 'email']
  });

  // Order confirmation template
  notificationTemplates.set('order_confirmation', {
    name: 'order_confirmation',
    type: NOTIFICATION_TYPES.EMAIL,
    subject: 'Order Confirmed - {{orderId}}',
    body: 'Hi {{firstName}}, your order {{orderId}} has been confirmed! Total: ${{total}}',
    variables: ['firstName', 'orderId', 'total']
  });

  // Order shipped template
  notificationTemplates.set('order_shipped', {
    name: 'order_shipped',
    type: NOTIFICATION_TYPES.EMAIL,
    subject: 'Your Order Has Shipped!',
    body: 'Hi {{firstName}}, your order {{orderId}} is on its way! Tracking: {{trackingNumber}}',
    variables: ['firstName', 'orderId', 'trackingNumber']
  });

  // Low stock alert template
  notificationTemplates.set('low_stock_alert', {
    name: 'low_stock_alert',
    type: NOTIFICATION_TYPES.EMAIL,
    subject: 'Low Stock Alert - {{productName}}',
    body: 'Alert: {{productName}} is running low on stock. Current stock: {{currentStock}}',
    variables: ['productName', 'currentStock', 'threshold']
  });

  console.log('📧 Initialized notification templates');
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    queueSize: notificationQueue.length,
    totalNotifications: notifications.length
  });
});

// Send notification
app.post('/api/notifications/send', authenticateToken, async (req, res) => {
  try {
    const { error, value } = sendNotificationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { userId, type, subject, message, metadata } = value;

    // Get user details from User Service
    const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}` }
    });

    if (!userResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResponse.data.data;

    // Create notification
    const notification = {
      id: uuidv4(),
      userId,
      type,
      subject,
      message,
      metadata: metadata || {},
      status: NOTIFICATION_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      sentAt: null,
      deliveredAt: null
    };

    // Process notification based on type
    let result;
    switch (type) {
      case NOTIFICATION_TYPES.EMAIL:
        result = await sendEmail(user.email, subject, message);
        break;
      case NOTIFICATION_TYPES.SMS:
        result = await sendSMS(user.phone || '1234567890', message);
        break;
      case NOTIFICATION_TYPES.PUSH:
        result = await sendPushNotification(user.id, subject, message);
        break;
      case NOTIFICATION_TYPES.IN_APP:
        result = await sendInAppNotification(user.id, subject, message);
        break;
      default:
        result = { success: false, message: 'Unknown notification type' };
    }

    if (result.success) {
      notification.status = NOTIFICATION_STATUS.SENT;
      notification.sentAt = new Date().toISOString();
    } else {
      notification.status = NOTIFICATION_STATUS.FAILED;
    }

    notifications.push(notification);

    console.log(`📧 Notification sent to user ${userId}: ${type} - ${subject}`);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });

  } catch (error) {
    console.error('❌ Send notification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send notification using template
app.post('/api/notifications/send-template', authenticateToken, async (req, res) => {
  try {
    const { templateName, userId, variables } = req.body;

    if (!templateName || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Template name and user ID are required'
      });
    }

    const template = notificationTemplates.get(templateName);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Get user details
    const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}` }
    });

    if (!userResponse.data.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResponse.data.data;

    // Replace template variables
    let subject = template.subject;
    let body = template.body;

    const allVariables = { ...variables, ...user };
    template.variables.forEach(variable => {
      const value = allVariables[variable] || `{{${variable}}}`;
      subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    // Send notification
    const result = await sendNotification({
      userId,
      type: template.type,
      subject,
      message: body,
      metadata: { templateName, variables }
    });

    res.json({
      success: true,
      message: 'Template notification sent successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Send template notification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userNotifications = notifications.filter(n => n.userId === userId);
  
  console.log(`📧 Retrieved ${userNotifications.length} notifications for user ${userId}`);
  
  res.json({
    success: true,
    data: userNotifications,
    count: userNotifications.length
  });
});

// Get notification templates
app.get('/api/notifications/templates', authenticateToken, (req, res) => {
  const templates = Array.from(notificationTemplates.values());
  
  res.json({
    success: true,
    data: templates,
    count: templates.length
  });
});

// Create notification template
app.post('/api/notifications/templates', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createTemplateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { name, type, subject, body, variables } = value;

    // Check if template already exists
    if (notificationTemplates.has(name)) {
      return res.status(409).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }

    const template = {
      name,
      type,
      subject,
      body,
      variables: variables || [],
      createdAt: new Date().toISOString()
    };

    notificationTemplates.set(name, template);

    console.log(`📧 Created notification template: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });

  } catch (error) {
    console.error('❌ Create template error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Process event notifications (webhook endpoint)
app.post('/api/notifications/events', async (req, res) => {
  try {
    const { eventType, userId, data } = req.body;

    if (!eventType || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Event type and user ID are required'
      });
    }

    console.log(`📧 Processing event: ${eventType} for user ${userId}`);

    // Process different event types
    switch (eventType) {
      case EVENT_TYPES.USER_REGISTERED:
        await processUserRegisteredEvent(userId, data);
        break;
      case EVENT_TYPES.ORDER_CREATED:
        await processOrderCreatedEvent(userId, data);
        break;
      case EVENT_TYPES.ORDER_CONFIRMED:
        await processOrderConfirmedEvent(userId, data);
        break;
      case EVENT_TYPES.ORDER_SHIPPED:
        await processOrderShippedEvent(userId, data);
        break;
      case EVENT_TYPES.LOW_STOCK:
        await processLowStockEvent(data);
        break;
      default:
        console.log(`📧 Unknown event type: ${eventType}`);
    }

    res.json({
      success: true,
      message: 'Event processed successfully'
    });

  } catch (error) {
    console.error('❌ Process event error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get notification statistics
app.get('/api/notifications/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userNotifications = notifications.filter(n => n.userId === userId);
  
  const stats = {
    total: userNotifications.length,
    sent: userNotifications.filter(n => n.status === NOTIFICATION_STATUS.SENT).length,
    failed: userNotifications.filter(n => n.status === NOTIFICATION_STATUS.FAILED).length,
    byType: {}
  };

  // Count by type
  Object.values(NOTIFICATION_TYPES).forEach(type => {
    stats.byType[type] = userNotifications.filter(n => n.type === type).length;
  });

  res.json({
    success: true,
    data: stats
  });
});

// Helper functions for sending notifications
async function sendEmail(email, subject, message) {
  try {
    // In production, this would send real emails
    console.log(`📧 [EMAIL] To: ${email}, Subject: ${subject}`);
    console.log(`📧 [EMAIL] Message: ${message}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendSMS(phone, message) {
  try {
    // In production, this would send real SMS
    console.log(`📱 [SMS] To: ${phone}, Message: ${message}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return { success: true, message: 'SMS sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendPushNotification(userId, title, message) {
  try {
    // In production, this would send real push notifications
    console.log(`🔔 [PUSH] To: ${userId}, Title: ${title}, Message: ${message}`);
    
    // Simulate push notification
    await new Promise(resolve => setTimeout(resolve, 30));
    
    return { success: true, message: 'Push notification sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendInAppNotification(userId, title, message) {
  try {
    // In production, this would store in database for in-app display
    console.log(`📱 [IN-APP] To: ${userId}, Title: ${title}, Message: ${message}`);
    
    // Simulate in-app notification
    await new Promise(resolve => setTimeout(resolve, 20));
    
    return { success: true, message: 'In-app notification sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function sendNotification(notificationData) {
  // This is a helper function to send notifications
  // It would be called by the main send endpoint
  return { success: true, message: 'Notification sent' };
}

// Event processing functions
async function processUserRegisteredEvent(userId, data) {
  const template = notificationTemplates.get('welcome_email');
  if (template) {
    // Send welcome email
    console.log(`📧 Sending welcome email to user ${userId}`);
  }
}

async function processOrderCreatedEvent(userId, data) {
  console.log(`📧 Order created notification for user ${userId}`);
}

async function processOrderConfirmedEvent(userId, data) {
  const template = notificationTemplates.get('order_confirmation');
  if (template) {
    console.log(`📧 Sending order confirmation to user ${userId}`);
  }
}

async function processOrderShippedEvent(userId, data) {
  const template = notificationTemplates.get('order_shipped');
  if (template) {
    console.log(`📧 Sending order shipped notification to user ${userId}`);
  }
}

async function processLowStockEvent(data) {
  const template = notificationTemplates.get('low_stock_alert');
  if (template) {
    console.log(`📧 Sending low stock alert for product ${data.productId}`);
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

// Initialize templates on startup
initializeTemplates();

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Send notification: POST http://localhost:${PORT}/api/notifications/send`);
  console.log(`📋 Get notifications: GET http://localhost:${PORT}/api/notifications`);
  console.log(`🔗 Connected to User Service: ${USER_SERVICE_URL}`);
  console.log(`🔗 Connected to Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`🔗 Connected to Product Service: ${PRODUCT_SERVICE_URL}`);
});

module.exports = app;
