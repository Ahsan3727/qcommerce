const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler', required: true },
  name: String,
  description: String,
  category: String,
  price: Number,
  stock: { type: Number, default: 0 },
  image: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);