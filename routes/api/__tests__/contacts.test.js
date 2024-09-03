// routes/api/contacts.test.js
const request = require('supertest');
const app = require('../../../app');
const contactsModel = require('../../../models/contacts');
jest.mock('../../../models/contacts.js');

describe('Contacts API', () => {
  const mockContacts = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', favorite: false },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '0987654321', favorite: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/contacts should return all contacts', async () => {
    contactsModel.listContacts.mockResolvedValue(mockContacts);
    const response = await request(app).get('/api/contacts');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockContacts);
  });

  test('GET /api/contacts/:contactId should return a contact by ID', async () => {
    contactsModel.getContactById.mockResolvedValue(mockContacts[0]);
    const response = await request(app).get('/api/contacts/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockContacts[0]);
  });

  test('POST /api/contacts should create a new contact', async () => {
    const newContact = { name: 'New Contact', email: 'new@example.com', phone: '1122334455' };
    contactsModel.addContact.mockResolvedValue(newContact);
    const response = await request(app).post('/api/contacts').send(newContact);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(newContact);
  });

  test('DELETE /api/contacts/:contactId should delete a contact', async () => {
    contactsModel.removeContact.mockResolvedValue(true);
    const response = await request(app).delete('/api/contacts/1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Contact deleted' });
  });

  test('PUT /api/contacts/:contactId should update a contact', async () => {
    const updatedContact = { name: 'Updated Contact' };
    contactsModel.updateContact.mockResolvedValue({ id: '1', ...updatedContact });
    const response = await request(app).put('/api/contacts/1').send(updatedContact);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ id: '1', ...updatedContact });
  });

  test('PATCH /api/contacts/:contactId/favorite should update the favorite status', async () => {
    const updatedContact = { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', favorite: true };
    contactsModel.updateStatusContact.mockResolvedValue(updatedContact);

    const response = await request(app)
      .patch('/api/contacts/1/favorite')
      .send({ favorite: true });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(updatedContact);
  });

  test('PATCH /api/contacts/:contactId/favorite should return 400 if favorite is missing', async () => {
    const response = await request(app)
      .patch('/api/contacts/1/favorite')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: 'missing field favorite' });
  });

  test('PATCH /api/contacts/:contactId/favorite should return 404 if contact not found', async () => {
    contactsModel.updateStatusContact.mockResolvedValue(null);

    const response = await request(app)
      .patch('/api/contacts/999/favorite')
      .send({ favorite: true });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: 'Not found' });
  });
});
