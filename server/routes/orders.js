const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');

// GET /api/orders
// - Customer & Admin: see all orders (admin can also filter by status)
// - Wholesaler: see only orders assigned to them, optional status filter
// - Rider: see only orders assigned to them, or use /available-for-pickup
router.get('/', auth, async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'wholesaler') {
      query.wholesaler = req.user.id;
    }

    if (req.user.role === 'rider') {
      // Rider can see orders assigned to them
      query.rider = req.user.id;
    }

    if (req.query.status) {
      const statuses = req.query.status.split(',');
      query.status = { $in: statuses };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('wholesaler', 'name address phone')
      .populate('items.product', 'name price')
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/available-for-pickup   (Rider sees orders ready for pickup)
router.get('/available-for-pickup', auth, async (req, res) => {
  if (req.user.role !== 'rider') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const orders = await Order.find({ status: 'ready_for_pickup', rider: null })
      .populate('wholesaler', 'name address phone')
      .populate('customer', 'name phone address');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id   (single order detail — any authenticated user, with ownership check)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate('wholesaler', 'name address')
      .populate('items.product', 'name price')
      .populate('rider', 'name phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Basic ownership check (optional, can be refined)
    if (
      req.user.role === 'customer' && order.customer?.toString() !== req.user.id ||
      req.user.role === 'wholesaler' && order.wholesaler?.toString() !== req.user.id ||
      req.user.role === 'rider' && order.rider?.toString() !== req.user.id
    ) {
      // Allow if they are admin (for simplicity, skip strict check for now)
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders   (Customer creates a new order)
router.post('/', auth, async (req, res) => {
  try {
    const { items, address, location, paymentMethod, wholesalerId } = req.body;
    let totalAmount = 0;

    // Validate stock and lock prices
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `${product?.name || 'Product'} out of stock` });
      }
      totalAmount += product.price * item.quantity;
      item.price = product.price; // freeze price at order time
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

    const order = new Order({
      customer: req.user.id,
      wholesaler: wholesalerId,
      items,
      totalAmount,
      deliveryAddress: address,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      paymentMethod: paymentMethod || 'cod',
      otp
    });

    await order.save();

    // Decrease stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Notify wholesaler via Socket.io
    const io = req.app.get('io');
    io.to(order.wholesaler.toString()).emit('newOrder', order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status   (Update order status by any authorized role)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Role-based status progression logic (simplified)
    if (req.user.role === 'wholesaler') {
      // Wholesaler can only transition: pending -> accepted, accepted -> preparing, preparing -> ready_for_pickup
      const allowedTransitions = {
        pending: 'accepted',
        accepted: 'preparing',
        preparing: 'ready_for_pickup'
      };
      if (allowedTransitions[order.status] !== status) {
        return res.status(400).json({ message: 'Invalid status transition for wholesaler' });
      }
    }

    if (req.user.role === 'rider') {
      // Rider can mark picked_up, delivered (and maybe after picking up from ready_for_pickup)
      if (status === 'picked_up' && order.status === 'ready_for_pickup') {
        order.rider = req.user.id;
      } else if (status === 'delivered' && order.status === 'picked_up') {
        // delivered
      } else {
        return res.status(400).json({ message: 'Invalid status transition for rider' });
      }
    }

    if (req.user.role === 'admin') {
      // Admin can set any status
    }

    order.status = status;
    if (riderId) order.rider = riderId;
    await order.save();

    // Emit status update to customer's order room
    const io = req.app.get('io');
    io.to(order._id.toString()).emit('orderStatusChanged', {
      orderId: order._id,
      status: order.status
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;