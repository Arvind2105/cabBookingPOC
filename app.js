const express = require('express');
const bodyParser = require('body-parser');
// const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cabRoutes = require('./routes/cabRoutes');
const port = process.env.PORT || '5000'
const connectDB = require('./db/connectDB');
const connectTestDB = require('./db/connectTestDB');
const app = express();

// for connecting with Database...
// connectDB();
connectTestDB();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/cabs', cabRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;