const mongoose = require('mongoose');

const wholesalerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true },
  password: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  commissionRate: { type: Number, default: 10 }, // Platform commission %
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Wholesaler', wholesalerSchema);