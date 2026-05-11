const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  addresses: [{
    label: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]  // [lng, lat]
    }
  }],
  role: { type: String, default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);