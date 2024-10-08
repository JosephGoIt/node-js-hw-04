const Contact = require('./contact');

const listContacts = async (userId, { page = 1, limit = 20, favorite }) => {
  const skip = (page - 1) * limit;
  const filter = { owner: userId };
  if (favorite !== undefined) {
    filter.favorite = favorite === 'true';
  }
  return await Contact.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .populate('owner', 'email subscription');
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

const removeContact = async (contactId) => {
  return await Contact.findByIdAndDelete(contactId);
};

const addContact = async (body) => {
  const contact = new Contact(body);
  return await contact.save();
};

const updateContact = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(contactId, body, { new: true });
};

const updateStatusContact = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(contactId, body, { new: true });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
