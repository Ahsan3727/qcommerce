const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const riderRoutes = require('./routes/riders');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log('➡️', req.method, req.url, 'BODY:', req.body);
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/riders', riderRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('riderLocation', (data) => {
    io.emit('riderLocationUpdate', data);
  });

  socket.on('joinOrderRoom', (orderId) => {
    socket.join(orderId);
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

app.set('io', io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));