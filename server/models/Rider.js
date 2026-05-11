const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  vehicleNumber: String,
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  }
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);