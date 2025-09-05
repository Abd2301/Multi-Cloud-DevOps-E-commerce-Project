# 👤 User Service

The User Service handles user authentication, registration, and profile management for our e-commerce platform. Think of it as the "security desk" that manages who can access our store and what they can do.

## 🎯 What This Service Does

- **User Registration**: Create new user accounts
- **User Authentication**: Login and verify user identity
- **Profile Management**: Update user information
- **Token Verification**: Validate JWT tokens for other services
- **Role-Based Access**: Different permissions for customers and admins
- **Security**: Password hashing and input validation

## 🔐 Authentication Concepts

### JWT Tokens (JSON Web Tokens)
Think of JWT tokens like **temporary ID badges**:
- When you log in, you get a badge (token)
- This badge proves who you are to other services
- The badge expires after 24 hours for security
- Other services can check if your badge is valid

### Password Hashing
Passwords are never stored in plain text:
- `bcrypt` scrambles passwords like a blender
- Even if someone steals our database, they can't see passwords
- When you login, we scramble your input and compare it

### Role-Based Access
- **Customer**: Can view and update their own profile
- **Admin**: Can view all users and manage the system

## 🚀 How to Run

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
```bash
cd apps/user-service
npm install
```

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check for Kubernetes | No |
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | Login user | No |
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| GET | `/api/users` | Get all users (admin only) | Yes (Admin) |
| POST | `/api/users/verify` | Verify JWT token | No |

## 🔍 Example API Calls

### Register New User
```bash
curl -X POST http://localhost:3002/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "User"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3002/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Get User Profile (with token)
```bash
curl -X GET http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3002/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'
```

### Verify Token (for other services)
```bash
curl -X POST http://localhost:3002/api/users/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_JWT_TOKEN"}'
```

## 🔒 Security Features

### Password Security
- Passwords are hashed using `bcrypt` with salt rounds
- Never stored in plain text
- Minimum 6 characters required

### Input Validation
- Email format validation
- Required field validation
- Data sanitization

### JWT Security
- Tokens expire after 24 hours
- Secret key for signing (should be environment variable in production)
- Token verification for protected routes

### CORS Protection
- Allows cross-origin requests from other services
- Configurable for production environments

## 🏗️ Architecture Notes

This service follows the **Single Responsibility Principle** - it only handles user-related operations. Other services can verify tokens by calling the `/verify` endpoint.

In a real-world scenario, this service would:
- Connect to a database (PostgreSQL, MongoDB)
- Use environment variables for secrets
- Implement rate limiting
- Add email verification
- Include password reset functionality

## 🔧 Environment Variables

- `PORT`: Server port (default: 3002)
- `JWT_SECRET`: Secret key for JWT tokens (default: development key)
- `NODE_ENV`: Environment (development, production)

## 🧪 Testing

The service includes comprehensive tests covering:
- User registration and validation
- Login authentication
- Token verification
- Profile management
- Role-based access control
- Error handling

Run `npm test` to verify everything is working.

## 🔄 How Other Services Use This

Other microservices can verify user tokens:

```javascript
// In Product Service or Order Service
const response = await fetch('http://user-service:3002/api/users/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: userToken })
});

if (response.ok) {
  const userData = await response.json();
  // User is authenticated, proceed with request
} else {
  // User is not authenticated, return 401
}
```

---

*This is part of a learning project to understand microservices architecture and DevOps practices.*
