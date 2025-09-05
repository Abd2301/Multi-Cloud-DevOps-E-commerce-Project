const request = require('supertest');
const app = require('./server');

describe('Product Service API', () => {
  // Test health check endpoint
  test('GET /health should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('product-service');
  });

  // Test get all products
  test('GET /api/products should return all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(4);
    expect(response.body.count).toBe(4);
  });

  // Test get specific product
  test('GET /api/products/1 should return specific product', async () => {
    const response = await request(app).get('/api/products/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(1);
    expect(response.body.data.name).toBe('Wireless Headphones');
  });

  // Test get non-existent product
  test('GET /api/products/999 should return 404', async () => {
    const response = await request(app).get('/api/products/999');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Product not found');
  });

  // Test search by category
  test('GET /api/products/category/electronics should return electronics', async () => {
    const response = await request(app).get('/api/products/category/electronics');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.category).toBe('electronics');
    expect(response.body.data).toHaveLength(1);
  });

  // Test update stock
  test('PATCH /api/products/1/stock should update stock', async () => {
    const response = await request(app)
      .patch('/api/products/1/stock')
      .send({ quantity: 100 });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.stock).toBe(100);
  });
});
