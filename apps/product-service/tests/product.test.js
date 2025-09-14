/**
 * Product Service Unit Tests
 * Comprehensive test suite for product catalog and inventory management
 */

const request = require('supertest');
const app = require('../server');

describe('Product Service API', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    server.close();
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('count');
    });

    it('should return products with correct structure', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      const product = response.body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('description');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product by ID', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('GET /api/products/category/:category', () => {
    it('should return products by category', async () => {
      const response = await request(app)
        .get('/api/products/category/electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('category', 'electronics');
      
      // All returned products should be in electronics category
      response.body.data.forEach(product => {
        expect(product.category.toLowerCase()).toBe('electronics');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/products/category/nonexistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('PUT /api/products/:id/stock', () => {
    it('should update product stock successfully', async () => {
      const newStock = 50;
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({ quantity: newStock })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stock).toBe(newStock);
      expect(response.body.message).toBe('Stock updated successfully');
    });

    it('should reject negative stock quantity', async () => {
      const response = await request(app)
        .put('/api/products/1/stock')
        .send({ quantity: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Quantity cannot be negative');
    });

    it('should return 404 for non-existent product stock update', async () => {
      const response = await request(app)
        .put('/api/products/999/stock')
        .send({ quantity: 10 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('product-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('active_connections');
    });
  });
});
