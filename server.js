// server.js
const app = require('./app');
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

app.listen(3000, () => {
  console.log('Server is running. Use our API on port: 3000');
});

