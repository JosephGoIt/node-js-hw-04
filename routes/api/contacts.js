const express = require('express');
const Joi = require('joi');
const auth = require('../../middlewares/auth');
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require('../../models/contacts');

const router = express.Router();

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

// List contacts with pagination and filtering
router.get('/', auth, async (req, res, next) => {
  try {
    const contacts = await listContacts(req.user._id, req.query);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// Get a single contact by ID
router.get('/:contactId', auth, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (contact && contact.owner.toString() === req.user._id.toString()) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Add a new contact
router.post('/', auth, async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: `missing required ${error.details[0].path[0]} field` });
    }
    const newContact = await addContact({ ...req.body, owner: req.user._id });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// Delete a contact by ID
router.delete('/:contactId', auth, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact || contact.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Not found' });
    }
    await removeContact(req.params.contactId);
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
});

// Update a contact by ID
router.put('/:contactId', auth, async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'missing fields' });
    }
    const contact = await getContactById(req.params.contactId);
    if (!contact || contact.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Not found' });
    }
    const updatedContact = await updateContact(req.params.contactId, req.body);
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// Update the favorite status of a contact
router.patch('/:contactId/favorite', auth, async (req, res, next) => {
  try {
    const { error } = favoriteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'missing field favorite' });
    }
    const contact = await getContactById(req.params.contactId);
    if (!contact || contact.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Not found' });
    }
    const updatedContact = await updateStatusContact(req.params.contactId, req.body);
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
