const request = require('supertest');
const app = require('./server');

describe('User Service API', () => {
  let authToken;
  let testUserId;

  // Test health check endpoint
  test('GET /health should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('user-service');
  });

  // Test user registration
  test('POST /api/users/register should create new user', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(newUser.email);
    expect(response.body.data.firstName).toBe(newUser.firstName);
    expect(response.body.data.lastName).toBe(newUser.lastName);
    expect(response.body.data.password).toBeUndefined(); // Password should not be returned

    testUserId = response.body.data.id;
  });

  // Test duplicate registration
  test('POST /api/users/register with existing email should return 409', async () => {
    const duplicateUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Another',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(duplicateUser);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User already exists with this email');
  });

  // Test registration validation
  test('POST /api/users/register with invalid data should return 400', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: '123', // Too short
      firstName: 'T',
      lastName: 'U'
    };

    const response = await request(app)
      .post('/api/users/register')
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
  });

  // Test user login
  test('POST /api/users/login should authenticate user', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(loginData.email);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT format

    authToken = response.body.data.token;
  });

  // Test login with wrong password
  test('POST /api/users/login with wrong password should return 401', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  // Test login with non-existent user
  test('POST /api/users/login with non-existent user should return 401', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginData);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  // Test get profile with valid token
  test('GET /api/users/profile with valid token should return user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.password).toBeUndefined();
  });

  // Test get profile without token
  test('GET /api/users/profile without token should return 401', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access token required');
  });

  // Test get profile with invalid token
  test('GET /api/users/profile with invalid token should return 403', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  // Test update profile
  test('PUT /api/users/profile should update user profile', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.firstName).toBe('Updated');
    expect(response.body.data.lastName).toBe('Name');
  });

  // Test verify token endpoint
  test('POST /api/users/verify with valid token should return user info', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ token: authToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.id).toBeDefined();
  });

  // Test verify token with invalid token
  test('POST /api/users/verify with invalid token should return 401', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ token: 'invalid-token' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid token');
  });

  // Test get all users (admin only) - using existing admin user
  test('GET /api/users as admin should return all users', async () => {
    // First login as admin user
    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: 'jane.smith@example.com',
        password: 'password'
      });

    const adminToken = adminLogin.body.data.token;

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.count).toBeGreaterThan(0);
  });

  // Test get all users as non-admin
  test('GET /api/users as non-admin should return 403', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Admin access required');
  });
});
