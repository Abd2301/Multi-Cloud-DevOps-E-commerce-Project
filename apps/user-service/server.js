const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
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
  defaultMeta: { service: 'user-service' },
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
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Environment validation
const requiredEnvVars = ['JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    logger.warn(`Missing environment variable: ${envVar}. Using default value.`);
  }
});

// Validate JWT secret strength in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  logger.error('CRITICAL: Using default JWT secret in production!');
  process.exit(1);
}

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

const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(authAttempts);

// Middleware - Same security guards as Product Service
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

// Sample user data - In real world, this would be in a database
const users = [
  {
    id: 1,
    email: 'john.doe@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-16T14:20:00Z'
  }
];

// Validation schemas - Like bouncers checking IDs
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Middleware to verify JWT token - Like checking ID at the door
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-service',
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

// User registration - "Welcome! Let's create your account"
app.post('/api/users/register', async (req, res) => {
  try {
    // Validate input data
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      logger.warn('Registration validation failed', { 
        error: error.details[0].message,
        email: req.body.email 
      });
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      authAttempts.labels('register', 'failed').inc();
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password - Like putting it in a safe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    logger.info('New user registered', { email, userId: user.id });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword
    });

  } catch (error) {
    logger.error('Registration error', { 
      error: error.message, 
      stack: error.stack,
      email: req.body.email 
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User login - "Prove you are who you say you are"
app.post('/api/users/login', async (req, res) => {
  try {
    // Validate input data
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      authAttempts.labels('login', 'failed').inc();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password - Like checking if the key fits the lock
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token - Like giving them a temporary pass
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Track successful login
    authAttempts.labels('login', 'success').inc();
    logger.info('User login successful', { email, userId: user.id });

    // Return user info and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile - "Here's your information"
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

// Update user profile - "Update your information"
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { firstName, lastName } = req.body;
  
  // Update user data
  if (firstName) users[userIndex].firstName = firstName;
  if (lastName) users[userIndex].lastName = lastName;

  logger.info('User profile updated', { email: users[userIndex].email, userId: users[userIndex].id });

  const { password: _, ...userWithoutPassword } = users[userIndex];
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: userWithoutPassword
  });
});

// Get all users (admin only) - "Show me all customers"
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  
  res.json({
    success: true,
    data: usersWithoutPasswords,
    count: usersWithoutPasswords.length
  });
});

// Verify token endpoint - For other services to check if token is valid
app.post('/api/users/verify', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const user = users.find(u => u.id === decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  });
});

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
  logger.info('User Service started successfully', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  logger.info('Service endpoints available', {
    health: `http://localhost:${PORT}/health`,
    register: `POST http://localhost:${PORT}/api/users/register`,
    login: `POST http://localhost:${PORT}/api/users/login`,
    profile: `GET http://localhost:${PORT}/api/users/profile`,
    verify: `POST http://localhost:${PORT}/api/users/verify`
  });
});

module.exports = app;
