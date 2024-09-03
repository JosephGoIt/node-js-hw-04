// db.js
const mongoose = require('mongoose');

const mongoDBUrl = 'mongodb+srv://spongkj:lkyG5ZtEEzR7BopC@clustergoit.vyt5o.mongodb.net/db-contacts?retryWrites=true&w=majority&appName=ClusterGoit';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoDBUrl);
    console.log(`Database connection successful: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
