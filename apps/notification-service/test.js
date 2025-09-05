const request = require('supertest');
const app = require('./server');

// Mock axios for testing
jest.mock('axios');
const axios = require('axios');

describe('Notification Service API', () => {
  let authToken;
  let mockUser;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock user data
    mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890'
    };

    // Mock axios responses
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/users/verify')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockUser
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/profile')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockUser
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    // Mock setTimeout for async operations
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test health check endpoint
  test('GET /health should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('notification-service');
    expect(response.body.queueSize).toBeDefined();
    expect(response.body.totalNotifications).toBeDefined();
  });

  // Test send email notification
  test('POST /api/notifications/send should send email notification', async () => {
    const notificationData = {
      userId: 1,
      type: 'email',
      subject: 'Test Email',
      message: 'This is a test email notification'
    };

    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBe(1);
    expect(response.body.data.type).toBe('email');
    expect(response.body.data.subject).toBe('Test Email');
    expect(response.body.data.status).toBe('sent');
  });

  // Test send SMS notification
  test('POST /api/notifications/send should send SMS notification', async () => {
    const notificationData = {
      userId: 1,
      type: 'sms',
      subject: 'Test SMS',
      message: 'This is a test SMS notification'
    };

    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('sms');
    expect(response.body.data.status).toBe('sent');
  });

  // Test send push notification
  test('POST /api/notifications/send should send push notification', async () => {
    const notificationData = {
      userId: 1,
      type: 'push',
      subject: 'Test Push',
      message: 'This is a test push notification'
    };

    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('push');
    expect(response.body.data.status).toBe('sent');
  });

  // Test send in-app notification
  test('POST /api/notifications/send should send in-app notification', async () => {
    const notificationData = {
      userId: 1,
      type: 'in_app',
      subject: 'Test In-App',
      message: 'This is a test in-app notification'
    };

    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send(notificationData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('in_app');
    expect(response.body.data.status).toBe('sent');
  });

  // Test send notification validation
  test('POST /api/notifications/send with invalid data should return 400', async () => {
    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userId: 'invalid',
        type: 'invalid_type',
        subject: '',
        message: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
  });

  // Test send notification without token
  test('POST /api/notifications/send without token should return 401', async () => {
    const response = await request(app)
      .post('/api/notifications/send')
      .send({
        userId: 1,
        type: 'email',
        subject: 'Test',
        message: 'Test message'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access token required');
  });

  // Test send template notification
  test('POST /api/notifications/send-template should send template notification', async () => {
    const response = await request(app)
      .post('/api/notifications/send-template')
      .set('Authorization', 'Bearer valid-token')
      .send({
        templateName: 'welcome_email',
        userId: 1,
        variables: {
          firstName: 'Test',
          lastName: 'User'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Template notification sent successfully');
  });

  // Test send template notification with non-existent template
  test('POST /api/notifications/send-template with non-existent template should return 404', async () => {
    const response = await request(app)
      .post('/api/notifications/send-template')
      .set('Authorization', 'Bearer valid-token')
      .send({
        templateName: 'non_existent_template',
        userId: 1
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Template not found');
  });

  // Test get user notifications
  test('GET /api/notifications should return user notifications', async () => {
    // First send a notification
    await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userId: 1,
        type: 'email',
        subject: 'Test Email',
        message: 'Test message'
      });

    // Then get notifications
    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.count).toBeGreaterThan(0);
  });

  // Test get notification templates
  test('GET /api/notifications/templates should return templates', async () => {
    const response = await request(app)
      .get('/api/notifications/templates')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.count).toBeGreaterThan(0);
    
    // Check if default templates exist
    const templateNames = response.body.data.map(t => t.name);
    expect(templateNames).toContain('welcome_email');
    expect(templateNames).toContain('order_confirmation');
  });

  // Test create notification template
  test('POST /api/notifications/templates should create template', async () => {
    const templateData = {
      name: 'test_template',
      type: 'email',
      subject: 'Test Subject {{name}}',
      body: 'Hello {{name}}, this is a test template.',
      variables: ['name', 'email']
    };

    const response = await request(app)
      .post('/api/notifications/templates')
      .set('Authorization', 'Bearer valid-token')
      .send(templateData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('test_template');
    expect(response.body.data.type).toBe('email');
    expect(response.body.data.variables).toEqual(['name', 'email']);
  });

  // Test create duplicate template
  test('POST /api/notifications/templates with duplicate name should return 409', async () => {
    const templateData = {
      name: 'welcome_email', // This already exists
      type: 'email',
      subject: 'Test Subject',
      body: 'Test body'
    };

    const response = await request(app)
      .post('/api/notifications/templates')
      .set('Authorization', 'Bearer valid-token')
      .send(templateData);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Template with this name already exists');
  });

  // Test create template validation
  test('POST /api/notifications/templates with invalid data should return 400', async () => {
    const response = await request(app)
      .post('/api/notifications/templates')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: '',
        type: 'invalid_type',
        subject: '',
        body: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
  });

  // Test process event notifications
  test('POST /api/notifications/events should process events', async () => {
    const eventData = {
      eventType: 'user_registered',
      userId: 1,
      data: { firstName: 'Test', lastName: 'User' }
    };

    const response = await request(app)
      .post('/api/notifications/events')
      .send(eventData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Event processed successfully');
  });

  // Test process event with missing data
  test('POST /api/notifications/events with missing data should return 400', async () => {
    const response = await request(app)
      .post('/api/notifications/events')
      .send({
        eventType: 'user_registered'
        // Missing userId
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Event type and user ID are required');
  });

  // Test get notification statistics
  test('GET /api/notifications/stats should return statistics', async () => {
    // First send some notifications
    await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userId: 1,
        type: 'email',
        subject: 'Test 1',
        message: 'Message 1'
      });

    await request(app)
      .post('/api/notifications/send')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userId: 1,
        type: 'sms',
        subject: 'Test 2',
        message: 'Message 2'
      });

    const response = await request(app)
      .get('/api/notifications/stats')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBeGreaterThan(0);
    expect(response.body.data.sent).toBeGreaterThan(0);
    expect(response.body.data.byType).toBeDefined();
    expect(response.body.data.byType.email).toBeGreaterThan(0);
    expect(response.body.data.byType.sms).toBeGreaterThan(0);
  });

  // Test token verification failure
  test('GET /api/notifications with invalid token should return 401', async () => {
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/users/verify')) {
        return Promise.resolve({
          data: {
            success: false,
            message: 'Invalid token'
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    const response = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid token');
  });
});
