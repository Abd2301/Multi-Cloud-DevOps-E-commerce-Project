const request = require('supertest');
const app = require('./server');

// Mock axios for testing
jest.mock('axios');
const axios = require('axios');

describe('Order Service API', () => {
  let authToken;
  let mockUser;
  let mockProduct;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Clear orders array between tests
    if (process.env.NODE_ENV === 'test') {
      try {
        await request(app).post('/test/clear-orders');
      } catch (error) {
        // Ignore if endpoint doesn't exist
      }
    }
    
    // Mock user data
    mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'customer'
    };

    // Mock product data
    mockProduct = {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      stock: 50,
      category: 'Electronics'
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
      if (url.includes('/api/products/1')) {
        return Promise.resolve({
          data: {
            success: true,
            data: mockProduct
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    axios.patch.mockImplementation((url, data) => {
      if (url.includes('/api/products/1/stock')) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Stock updated successfully'
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    // Mock successful payment
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
    expect(response.body.service).toBe('order-service');
  });

  // Test get empty cart
  test('GET /api/cart should return empty cart for new user', async () => {
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toHaveLength(0);
    expect(response.body.data.total).toBe(0);
    expect(response.body.data.itemCount).toBe(0);
  });

  // Test add item to cart
  test('POST /api/cart/items should add item to cart', async () => {
    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 1,
        quantity: 2
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.cart.items).toHaveLength(1);
    expect(response.body.data.cart.items[0].productId).toBe(1);
    expect(response.body.data.cart.items[0].quantity).toBe(2);
    expect(response.body.data.cart.items[0].name).toBe('Wireless Headphones');
    expect(response.body.data.cart.total).toBe(199.98);
  });

  // Test add item to cart with insufficient stock
  test('POST /api/cart/items with insufficient stock should return 400', async () => {
    // Mock product with low stock
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products/1')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { ...mockProduct, stock: 1 }
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 1,
        quantity: 5
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Insufficient stock');
  });

  // Test add non-existent product to cart
  test('POST /api/cart/items with non-existent product should return 404', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products/999')) {
        return Promise.resolve({
          data: {
            success: false,
            message: 'Product not found'
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 999,
        quantity: 1
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Product not found');
  });

  // Test add item validation
  test('POST /api/cart/items with invalid data should return 400', async () => {
    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 'invalid',
        quantity: -1
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
  });

  // Test remove item from cart
  test('DELETE /api/cart/items/:productId should remove item from cart', async () => {
    // First add an item
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 1,
        quantity: 2
      });

    // Then remove it
    const response = await request(app)
      .delete('/api/cart/items/1')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.cart.items).toHaveLength(0);
    expect(response.body.data.cart.total).toBe(0);
  });

  // Test remove non-existent item from cart
  test('DELETE /api/cart/items/:productId with non-existent item should return 404', async () => {
    const response = await request(app)
      .delete('/api/cart/items/999')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Item not found in cart');
  });

  // Test clear cart
  test('DELETE /api/cart should clear cart', async () => {
    // First add an item
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', 'Bearer valid-token')
      .send({
        productId: 1,
        quantity: 2
      });

    // Then clear cart
    const response = await request(app)
      .delete('/api/cart')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Cart cleared');

    // Verify cart is empty
    const cartResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer valid-token');

    expect(cartResponse.body.data.items).toHaveLength(0);
  });

  // Test create order
  test('POST /api/orders should create order from items', async () => {
    const orderData = {
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 99.99
        }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-token')
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.userId).toBe(1);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.subtotal).toBe(199.98);
    expect(response.body.data.shippingCost).toBe(0); // Free shipping over $100
    expect(response.body.data.tax).toBe(15.9984); // 8% of subtotal
    expect(response.body.data.total).toBe(215.9784);
    expect(response.body.data.status).toBe('confirmed');
    expect(response.body.data.paymentStatus).toBe('completed');
  });

  // Test create order with free shipping
  test('POST /api/orders with high value should get free shipping', async () => {
    const orderData = {
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 99.99
        }
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };

    // Mock product with higher price for free shipping
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/products/1')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { ...mockProduct, price: 150.00 }
          }
        });
      }
      return Promise.reject(new Error('Unexpected axios call'));
    });

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-token')
      .send({
        ...orderData,
        items: [{ ...orderData.items[0], price: 150.00 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.data.shippingCost).toBe(0); // Free shipping over $100
  });

  // Test create order validation
  test('POST /api/orders with invalid data should return 400', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-token')
      .send({
        items: [],
        shippingAddress: {
          street: '123 Main St'
          // Missing required fields
        },
        paymentMethod: 'invalid_method'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation error');
  });

  // Test get user orders
  test('GET /api/orders should return user orders', async () => {
    // First create an order
    const orderData = {
      items: [{ productId: 1, quantity: 1, price: 99.99 }],
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };

    await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-token')
      .send(orderData);

    // Then get orders
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.count).toBe(1);
  });

  // Test get specific order
  test('GET /api/orders/:orderId should return specific order', async () => {
    // First create an order
    const orderData = {
      items: [{ productId: 1, quantity: 1, price: 99.99 }],
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      paymentMethod: 'credit_card'
    };

    const createResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer valid-token')
      .send(orderData);

    const orderId = createResponse.body.data.id;

    // Then get specific order
    const response = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(orderId);
  });

  // Test get non-existent order
  test('GET /api/orders/:orderId with non-existent order should return 404', async () => {
    const response = await request(app)
      .get('/api/orders/non-existent-id')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Order not found');
  });

  // Test unauthorized access
  test('GET /api/cart without token should return 401', async () => {
    const response = await request(app).get('/api/cart');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access token required');
  });

  // Test token verification failure
  test('GET /api/cart with invalid token should return 401', async () => {
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
      .get('/api/cart')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid token');
  });
});
