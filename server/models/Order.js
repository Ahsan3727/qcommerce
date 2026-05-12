const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  wholesaler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wholesaler',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'preparing',
      'ready_for_pickup',
      'picked_up',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'jazzcash', 'easypaisa', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  otp: {
    type: String,
    required: true
  },
  deliveryPhoto: {
    type: String,
    default: null
  },
  customerNotes: {
    type: String,
    default: ''
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for fast queries
orderSchema.index({ orderNumber: -1 });
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ wholesaler: 1, status: 1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-increment order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const lastOrder = await mongoose.model('Order').findOne()
        .sort({ orderNumber: -1 })
        .select('orderNumber');
      
      this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Set actual delivery time when status changes to 'delivered'
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'delivered') {
    this.actualDeliveryTime = new Date();
    this.paymentStatus = 'paid';
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;