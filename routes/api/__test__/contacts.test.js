const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const User = require('../../../models/user');
const Contact = require('../../../models/contact');

let token;
let contactId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  await request(app).post('/api/users/signup').send({
    email: 'testuser1@example.com',
    password: 'password123',
  });

  const loginResponse = await request(app).post('/api/users/login').send({
    email: 'testuser1@example.com',
    password: 'password123',
  });

  token = loginResponse.body.token;  // Capture the token
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Contacts API', () => {
  test('should create a new contact', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        favorite: true,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('John Doe');
    
    contactId = response.body._id;
  });

  test('should get all contacts', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('should get a contact by ID', async () => {
    const response = await request(app)
      .get(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', contactId);
  });

  test('should update a contact', async () => {
    const response = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe Updated',
        email: 'johnupdated@example.com',
        phone: '0987654321',
        favorite: false,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('John Doe Updated');
  });

  test('should update the favorite status of a contact', async () => {
    const response = await request(app)
      .patch(`/api/contacts/${contactId}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        favorite: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.favorite).toBe(true);
  });

  test('should delete a contact', async () => {
    const response = await request(app)
      .delete(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Contact deleted');
  });
});
