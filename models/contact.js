const mongoose = require('mongoose');
const {Schema} = mongoose;

// Added owner to the Schema
const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;