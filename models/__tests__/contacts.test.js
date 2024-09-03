const mongoose = require('mongoose');
const contactsModel = require('../contacts');
const Contact = require('../contact');

jest.mock('../contact'); // Mock the Contact model

const mockContacts = [
  { _id: new mongoose.Types.ObjectId(), name: 'John Doe', email: 'john@example.com', phone: '1234567890', favorite: false },
  { _id: new mongoose.Types.ObjectId(), name: 'Jane Doe', email: 'jane@example.com', phone: '0987654321', favorite: false },
];

describe('Contacts Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listContacts should return all contacts', async () => {
    Contact.find.mockResolvedValue(mockContacts); // Mock the find method
    const contacts = await contactsModel.listContacts();
    expect(contacts).toEqual(mockContacts);
  });

  test('getContactById should return a contact by ID', async () => {
    Contact.findById.mockResolvedValue(mockContacts[0]); // Mock the findById method
    const contact = await contactsModel.getContactById(mockContacts[0]._id);
    expect(contact).toEqual(mockContacts[0]);
  });

  test('getContactById should return null if contact not found', async () => {
    Contact.findById.mockResolvedValue(null); // Mock the findById method to return null
    const contact = await contactsModel.getContactById(new mongoose.Types.ObjectId());
    expect(contact).toBeNull();
  });

  test('addContact should add a new contact', async () => {
    const newContact = { _id: new mongoose.Types.ObjectId(), name: 'New Contact', email: 'new@example.com', phone: '1122334455' };
    Contact.create.mockResolvedValue(newContact); // Mock the create method
    const result = await contactsModel.addContact(newContact);
    expect(result).toEqual(newContact);
  });

  test('removeContact should remove a contact by ID', async () => {
    Contact.findByIdAndDelete.mockResolvedValue(mockContacts[0]); // Mock the findByIdAndDelete method
    const result = await contactsModel.removeContact(mockContacts[0]._id);
    expect(result).toBe(true);
  });

  test('updateContact should update an existing contact', async () => {
    const updatedContact = { name: 'Updated Contact' };
    Contact.findByIdAndUpdate.mockResolvedValue({ ...mockContacts[0], ...updatedContact }); // Mock the findByIdAndUpdate method
    const result = await contactsModel.updateContact(mockContacts[0]._id, updatedContact);
    expect(result).toEqual({ ...mockContacts[0], ...updatedContact });
  });

  test('updateContact should return null if contact not found', async () => {
    Contact.findByIdAndUpdate.mockResolvedValue(null); // Mock the findByIdAndUpdate method to return null
    const result = await contactsModel.updateContact(new mongoose.Types.ObjectId(), { name: 'Updated Contact' });
    expect(result).toBeNull();
  });
});
