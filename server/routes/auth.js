const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wholesaler = require('../models/Wholesaler');
const Rider = require('../models/Rider');

// Register Customer
router.post('/register/customer', async (req, res) => {
  const { phone, password, name } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ phone, password: hashed, name });
    await user.save();
    const token = jwt.sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name, phone } });
  } catch (err) {
    res.status(400).json({ message: 'Phone already registered' });
  }
});

// Register Wholesaler (admin could use this to onboard)
router.post('/register/wholesaler', async (req, res) => {
  const { phone, password, name, address, location } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const wholesaler = new Wholesaler({ phone, password: hashed, name, address, location });
    await wholesaler.save();
    const token = jwt.sign({ id: wholesaler._id, role: 'wholesaler' }, process.env.JWT_SECRET);
    res.json({ token, user: { id: wholesaler._id, name, phone } });
  } catch (err) {
    res.status(400).json({ message: 'Phone already registered' });
  }
});

// Register Rider
router.post('/register/rider', async (req, res) => {
  const { phone, password, name, vehicleNumber } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const rider = new Rider({ phone, password: hashed, name, vehicleNumber });
    await rider.save();
    const token = jwt.sign({ id: rider._id, role: 'rider' }, process.env.JWT_SECRET);
    res.json({ token, user: { id: rider._id, name, phone } });
  } catch (err) {
    res.status(400).json({ message: 'Phone already registered' });
  }
});

// Login (generic for all roles)
router.post('/login', async (req, res) => {
  const { phone, password, role } = req.body;
  let model;
  if (role === 'wholesaler') model = Wholesaler;
  else if (role === 'rider') model = Rider;
  else model = User;

  const user = await model.findOne({ phone });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, role } });
});

module.exports = router;