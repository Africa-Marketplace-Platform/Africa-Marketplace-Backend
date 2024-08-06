const express = require('express');
const connectDB = require('./config/db');
const passport = require('passport');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
require('./config/passport'); // Import passport configuration

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const productRoutes = require('./routes/productRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const influencerRoutes = require('./routes/influencerRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const activityRoutes = require('./routes/activitylog');
const userRoutes = require('./routes/userRoutes');


const recommendationRoutes = require('./routes/recommendationRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes'); // Add wishlist routes

const app = express();

// Connect to database
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

app.use('/api/activity', activityRoutes);

app.use('/api/wishlist', wishlistRoutes); // Include wishlist routes

const server = http.createServer(app); // Create HTTP server
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ userId }) => {
    socket.join(userId);
  });

  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    io.to(receiverId).emit('receiveMessage', { senderId, message });
  });

  socket.on('disconnect', () => {
    console.log('User has left');
  });
});

// Starting server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
