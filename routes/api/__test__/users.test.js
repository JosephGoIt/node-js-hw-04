const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const User = require('../../../models/user');

let token;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Authentication API', () => {
  test('should sign up a new user', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('testuser@example.com');
  });

  test('should login the user and return a token', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('testuser@example.com');
    
    token = response.body.token;
  });

  test('should return current user data', async () => {
    const response = await request(app)
      .get('/api/users/current')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
    expect(response.body).toHaveProperty('subscription', 'starter');
  });

  test('should log out the user', async () => {
    const response = await request(app)
      .get('/api/users/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });
});
