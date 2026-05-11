const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');

// GET /api/products  — all available products for customer (optional: by wholesaler)
router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.wholesaler) filter.wholesaler = req.query.wholesaler;
    const products = await Product.find(filter).populate('wholesaler', 'name address');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/mine  — wholesaler’s own products
router.get('/mine', auth, async (req, res) => {
  if (req.user.role !== 'wholesaler') return res.status(403).json({ message: 'Access denied' });
  try {
    const products = await Product.find({ wholesaler: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id  — single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('wholesaler', 'name address');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  — wholesaler adds product
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'wholesaler') return res.status(403).json({ message: 'Access denied' });
  try {
    const { name, description, category, price, stock, image } = req.body;
    const product = new Product({
      wholesaler: req.user.id,
      name,
      description,
      category,
      price,
      stock,
      image,
      isAvailable: true
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/products/:id  — update (wholesaler owns product or admin)
router.patch('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.wholesaler.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { name, price, stock, isAvailable, category, description, image } = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (category) product.category = category;
    if (description) product.description = description;
    if (image) product.image = image;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;