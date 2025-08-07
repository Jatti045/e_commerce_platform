const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('POST /api/product/add-to-user-cart', () => {
  it('should fail when productId or userId is missing', async () => {
    const res = await request(app)
      .post('/api/product/add-to-user-cart')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty(
      'message',
      'We ran into an issue while adding the product to your cart. Please try again later.'
    );
  });
});
