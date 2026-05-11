const router = require('express').Router();
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const auth = require('../middleware/authMiddleware');

// PATCH /api/riders/location  — update current location (called frequently by rider app)
router.patch('/location', auth, async (req, res) => {
  if (req.user.role !== 'rider') return res.status(403).json({ message: 'Access denied' });
  try {
    const { coordinates } = req.body; // [lng, lat]
    await Rider.findByIdAndUpdate(req.user.id, {
      currentLocation: {
        type: 'Point',
        coordinates
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/riders/status  — toggle online/offline
router.patch('/status', auth, async (req, res) => {
  if (req.user.role !== 'rider') return res.status(403).json({ message: 'Access denied' });
  try {
    const { online } = req.body;
    await Rider.findByIdAndUpdate(req.user.id, { isOnline: online });
    res.json({ success: true, online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/riders/online  — get all online riders (for admin/manual assignment)
router.get('/online', auth, async (req, res) => {
  // (Optionally restrict to admin)
  try {
    const riders = await Rider.find({ isOnline: true }).select('-password');
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/riders/me  — get logged-in rider's profile
router.get('/me', auth, async (req, res) => {
  if (req.user.role !== 'rider') return res.status(403).json({ message: 'Access denied' });
  try {
    const rider = await Rider.findById(req.user.id).select('-password');
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;