const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  deliveryAddress: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
  paymentMethod: { type: String, enum: ['cod', 'jazzcash', 'easypaisa', 'card'], default: 'cod' },
  otp: String,           // For delivery confirmation
  deliveryPhoto: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);