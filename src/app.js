const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Import and use auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Import and use user routes
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

// Import and use chatroom routes
const chatroomRoutes = require('./routes/chatroom');
app.use('/', chatroomRoutes);

// Import and use message routes
const messageRoutes = require('./routes/message');
app.use('/', messageRoutes);

// Import and use subscription routes
const subscriptionRoutes = require('./routes/subscription');
app.use('/', subscriptionRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app; 